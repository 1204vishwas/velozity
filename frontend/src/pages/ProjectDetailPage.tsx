import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Project, Task, TaskStatus } from '../types';
import { projectsApi } from '../api/projects.api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import {
  Building2,
  User,
  Plus,
  ArrowLeft,
  Radio,
  Layers,
  LayoutGrid,
  List,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinProjectRoom, leaveProjectRoom } = useSocket();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const canManageTasks =
    user?.role === 'ADMIN' ||
    (user?.role === 'PROJECT_MANAGER' && project?.managerId === user?.id);

  // 1. Fetch Project Details
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    projectsApi
      .getProjectById(id)
      .then((data) => {
        setProject(data);
        setTasks(data.tasks || []);
      })
      .catch((err) => {
        console.error('Error fetching project:', err);
        // If 403 Forbidden (e.g. PM accessing another PM's project)
        if (err.response?.status === 403) {
          alert('Access Forbidden: You do not have permission to view this project.');
          navigate('/projects', { replace: true });
        }
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  // 2. Real-Time Project Room Subscription
  useEffect(() => {
    if (!id || !socket) return;

    // Join room for real-time task updates
    joinProjectRoom(id);

    const handleTaskStatusChanged = (data: {
      taskId: string;
      toStatus: TaskStatus;
      fromStatus: TaskStatus;
    }) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === data.taskId ? { ...t, status: data.toStatus } : t))
      );
    };

    const handleTaskCreated = (newTask: Task) => {
      if (newTask.projectId === id) {
        setTasks((prev) => {
          if (prev.some((t) => t.id === newTask.id)) return prev;
          return [newTask, ...prev];
        });
      }
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      if (updatedTask.projectId === id) {
        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
        );
      }
    };

    const handleTaskDeleted = (data: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== data.id));
    };

    socket.on('task:status_changed', handleTaskStatusChanged);
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      leaveProjectRoom(id);
      socket.off('task:status_changed', handleTaskStatusChanged);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [id, socket, joinProjectRoom, leaveProjectRoom]);

  const handleTaskStatusUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
    );
  };

  const handleTaskModalSuccess = (savedTask: Task) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === savedTask.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = savedTask;
        return next;
      }
      return [savedTask, ...prev];
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs">
        Loading project workspace and connecting to live room...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
        Project not found or access restricted.
      </div>
    );
  }

  // Group tasks by status for Kanban view
  const columns: Array<{ status: TaskStatus; label: string; color: string }> = [
    { status: 'TODO', label: 'To Do', color: 'border-slate-700 bg-slate-800/40 text-slate-300' },
    { status: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-800/60 bg-blue-950/30 text-blue-300' },
    { status: 'IN_REVIEW', label: 'In Review', color: 'border-amber-800/60 bg-amber-950/30 text-amber-300' },
    { status: 'DONE', label: 'Done', color: 'border-emerald-800/60 bg-emerald-950/30 text-emerald-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar: Back, Project Details, Live Badge, Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              to="/projects"
              className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Projects</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {project.name}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/80">
                <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" />
                Live Room: project:{project.id.slice(0, 8)}
              </span>
            </div>

            {project.description && (
              <p className="text-xs text-slate-400 max-w-3xl leading-relaxed pt-1">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2.5 self-start sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('board')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'board'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Board View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'list'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {canManageTasks && (
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Metadata Banner */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          <div className="flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5 text-brand-400" />
            <span>Client: <strong className="text-white">{project.client?.company}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span>Manager: <strong className="text-white">{project.manager?.name}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Total Tasks: <strong className="text-white">{tasks.length}</strong></span>
          </div>
        </div>
      </div>

      {/* View: Kanban Board or List */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col space-y-3 min-h-[450px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${col.color}`}
                    >
                      {col.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center text-slate-600 text-xs border border-dashed border-slate-800/80 rounded-xl">
                      No tasks in {col.label}
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onTaskUpdated={handleTaskStatusUpdated}
                        canEditDetails={canManageTasks}
                        onEdit={(task) => {
                          setEditingTask(task);
                          setIsTaskModalOpen(true);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onTaskUpdated={handleTaskStatusUpdated}
              canEditDetails={canManageTasks}
              onEdit={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={handleTaskModalSuccess}
        initialTask={editingTask}
        defaultProjectId={project.id}
      />
    </div>
  );
};
