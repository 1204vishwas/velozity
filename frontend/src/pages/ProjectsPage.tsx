import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { projectsApi } from '../api/projects.api';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { FolderKanban, Plus, RefreshCw } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectsApi.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateSuccess = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleEditSuccess = (updatedProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <FolderKanban className="w-6 h-6 text-brand-500" />
            <span>Client Projects</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {user?.role === 'ADMIN' && 'Manage all agency client projects and assignments.'}
            {user?.role === 'PROJECT_MANAGER' && 'Manage your assigned client projects and deliverables.'}
            {user?.role === 'DEVELOPER' && 'Projects containing tasks assigned to you.'}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchProjects}
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
            title="Refresh Projects"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && (
            <button
              onClick={() => {
                setEditingProject(null);
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
          <FolderKanban className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-sm font-semibold text-white">No Projects Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {canCreate
              ? 'Get started by creating your first client engagement project.'
              : 'You have not been assigned to any project tasks yet.'}
          </p>
          {canCreate && (
            <button
              onClick={() => {
                setEditingProject(null);
                setIsModalOpen(true);
              }}
              className="mt-2 inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Project</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              canEdit={canCreate}
              onEdit={(p) => {
                setEditingProject(p);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSuccess={editingProject ? handleEditSuccess : handleCreateSuccess}
        initialProject={editingProject}
      />
    </div>
  );
};
