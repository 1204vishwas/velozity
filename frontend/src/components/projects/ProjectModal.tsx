import React, { useState, useEffect } from 'react';
import { Project, Client, User, ProjectStatus } from '../../types';
import { projectsApi, CreateProjectPayload } from '../../api/projects.api';
import { clientsApi } from '../../api/clients.api';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { X, AlertCircle } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: Project) => void;
  initialProject?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialProject,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('ACTIVE');

  const [clients, setClients] = useState<Client[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      clientsApi.getClients().then(setClients).catch(console.error);
      if (user?.role === 'ADMIN') {
        authApi.getUsers('PROJECT_MANAGER').then(setManagers).catch(console.error);
      }

      if (initialProject) {
        setName(initialProject.name);
        setDescription(initialProject.description || '');
        setClientId(initialProject.clientId);
        setManagerId(initialProject.managerId);
        setStatus(initialProject.status);
      } else {
        setName('');
        setDescription('');
        setClientId('');
        setManagerId(user?.id || '');
        setStatus('ACTIVE');
      }
      setError(null);
    }
  }, [isOpen, initialProject, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientId) {
      setError('Please provide project name and select a client.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (initialProject) {
        const updated = await projectsApi.updateProject(initialProject.id, {
          name,
          description,
          clientId,
          status,
          ...(user?.role === 'ADMIN' && managerId ? { managerId } : {}),
        });
        onSuccess(updated);
      } else {
        const payload: CreateProjectPayload = {
          name,
          description,
          clientId,
          status,
          managerId: user?.role === 'ADMIN' && managerId ? managerId : user?.id,
        };
        const created = await projectsApi.createProject(payload);
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to save project.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <h3 className="text-base font-bold text-white">
            {initialProject ? 'Edit Project' : 'Create New Project'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Cloud Architecture Modernization"
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of goals, scope, and deliverables..."
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Client *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="PLANNING">Planning</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {user?.role === 'ADMIN' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assigned Project Manager
              </label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Select Manager</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-md shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
