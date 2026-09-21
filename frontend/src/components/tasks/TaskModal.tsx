import React, { useState, useEffect } from 'react';
import { Task, Project, User, TaskStatus, TaskPriority } from '../../types';
import { tasksApi, CreateTaskPayload } from '../../api/tasks.api';
import { projectsApi } from '../../api/projects.api';
import { authApi } from '../../api/auth.api';
import { X, AlertCircle } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (task: Task) => void;
  initialTask?: Task | null;
  defaultProjectId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTask,
  defaultProjectId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [assignedToId, setAssignedToId] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Load projects & developers
      projectsApi.getProjects().then(setProjects).catch(console.error);
      authApi.getUsers('DEVELOPER').then(setDevelopers).catch(console.error);

      if (initialTask) {
        setTitle(initialTask.title);
        setDescription(initialTask.description || '');
        setProjectId(initialTask.projectId);
        setAssignedToId(initialTask.assignedToId || '');
        setStatus(initialTask.status);
        setPriority(initialTask.priority);
        setDueDate(initialTask.dueDate.slice(0, 10));
      } else {
        setTitle('');
        setDescription('');
        setProjectId(defaultProjectId || '');
        setAssignedToId('');
        setStatus('TODO');
        setPriority('MEDIUM');
        // Default due date: 7 days from now
        const d = new Date();
        d.setDate(d.getDate() + 7);
        setDueDate(d.toISOString().slice(0, 10));
      }
      setError(null);
    }
  }, [isOpen, initialTask, defaultProjectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId || !dueDate) {
      setError('Please fill in all required fields (Title, Project, Due Date).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (initialTask) {
        // Edit
        const updated = await tasksApi.updateTaskDetails(initialTask.id, {
          title,
          description,
          priority,
          dueDate: new Date(dueDate).toISOString(),
          assignedToId: assignedToId || null,
          status,
        });
        onSuccess(updated);
      } else {
        // Create
        const payload: CreateTaskPayload = {
          title,
          description,
          projectId,
          assignedToId: assignedToId || null,
          priority,
          status,
          dueDate: new Date(dueDate).toISOString(),
        };
        const created = await tasksApi.createTask(payload);
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to save task.';
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
            {initialTask ? `Edit Task #${initialTask.taskNumber}` : 'Create New Task'}
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

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth2 Refresh Rotation"
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide technical context, acceptance criteria, or relevant links..."
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Project & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                disabled={!!initialTask}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-60"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assign Developer
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Unassigned</option>
                {developers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority, Status, Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Actions */}
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
              {isSubmitting ? 'Saving...' : initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
