import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { tasksApi } from '../api/tasks.api';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskModal } from '../components/tasks/TaskModal';
import { CheckSquare, Plus, RefreshCw } from 'lucide-react';

const PRIORITY_WEIGHTS: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const sortTasksByPriorityAndDueDate = (taskList: Task[]): Task[] => {
  return [...taskList].sort((a, b) => {
    const pA = PRIORITY_WEIGHTS[a.priority] || 0;
    const pB = PRIORITY_WEIGHTS[b.priority] || 0;
    if (pB !== pA) {
      return pB - pA;
    }
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return dateA - dateB;
  });
};

export const TasksPage: React.FC = () => {
  const { filters, activeFilterCount } = useTaskFilters();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await tasksApi.getTasks(filters);
      setTasks(sortTasksByPriorityAndDueDate(data));
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [
    filters.status,
    filters.priority,
    filters.dueStart,
    filters.dueEnd,
    filters.projectId,
    filters.isOverdue,
    filters.search,
  ]);

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      sortTasksByPriorityAndDueDate(
        prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
      )
    );
  };

  const handleTaskModalSuccess = (savedTask: Task) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === savedTask.id);
      let next: Task[];
      if (idx !== -1) {
        next = [...prev];
        next[idx] = savedTask;
      } else {
        next = [savedTask, ...prev];
      }
      return sortTasksByPriorityAndDueDate(next);
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <CheckSquare className="w-6 h-6 text-brand-500" />
            <span>Task Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {user?.role === 'ADMIN' && 'Comprehensive task tracking across all agency projects.'}
            {user?.role === 'PROJECT_MANAGER' && 'Tasks belonging strictly to your managed projects.'}
            {user?.role === 'DEVELOPER' && 'Tasks assigned specifically to you.'}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchTasks}
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && (
            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* URL-Synchronized Filters Bar */}
      <TaskFilters />

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <div>
          Found <strong className="text-white font-semibold">{tasks.length}</strong> tasks
          {activeFilterCount > 0 && ` (with ${activeFilterCount} active filters)`}
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          Sorted by Priority & Due Date
        </div>
      </div>

      {/* Tasks Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
          <CheckSquare className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-sm font-semibold text-white">No Matching Tasks</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No tasks match your selected query parameters and permissions. Try adjusting the filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onTaskUpdated={handleTaskUpdated}
              canEditDetails={canCreate}
              onEdit={(t) => {
                setEditingTask(t);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={handleTaskModalSuccess}
        initialTask={editingTask}
      />
    </div>
  );
};
