import React, { useState, useEffect } from 'react';
import { DeveloperDashboardStats, Task } from '../../types';
import { MetricsCard } from './MetricsCard';
import { LiveActivityFeed } from '../activity/LiveActivityFeed';
import { TaskCard } from '../tasks/TaskCard';
import { tasksApi } from '../../api/tasks.api';
import {
  CheckSquare,
  AlertTriangle,
  Layers,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PRIORITY_WEIGHTS: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const sortTasksByPriorityAndDueDate = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const pA = PRIORITY_WEIGHTS[a.priority] || 0;
    const pB = PRIORITY_WEIGHTS[b.priority] || 0;
    if (pB !== pA) {
      return pB - pA; // Higher priority first (CRITICAL -> HIGH -> MEDIUM -> LOW)
    }
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return dateA - dateB; // Earlier due date first
  });
};

export const DeveloperDashboard: React.FC<{ stats: DeveloperDashboardStats }> = ({ stats }) => {
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);

  const fetchMyTasks = () => {
    setIsLoadingTasks(true);
    tasksApi
      .getTasks()
      .then((tasks) => {
        // Developer API returns tasks assigned only to them, sorted by priority then dueDate
        setMyTasks(sortTasksByPriorityAndDueDate(tasks));
      })
      .catch(console.error)
      .finally(() => setIsLoadingTasks(false));
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleTaskUpdated = (updatedTask: Task) => {
    setMyTasks((prev) =>
      sortTasksByPriorityAndDueDate(
        prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
      )
    );
  };

  const statusCounts = stats.tasksByStatus || {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top 4 Developer Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Assigned Tasks"
          value={stats.assignedTasksCount}
          icon={CheckSquare}
          color="brand"
          subtext="Assigned exclusively to you"
          badgeText="My Work"
        />

        <MetricsCard
          title="In Progress"
          value={statusCounts.IN_PROGRESS}
          icon={Flame}
          color="purple"
          subtext="Active working tasks"
          badgeText="In Progress"
        />

        <MetricsCard
          title="In Review"
          value={statusCounts.IN_REVIEW}
          icon={Layers}
          color="amber"
          subtext="Awaiting PM sign-off"
          badgeText="Pending Review"
        />

        <MetricsCard
          title="Overdue Tasks"
          value={stats.overdueTaskCount}
          icon={AlertTriangle}
          color="rose"
          subtext="Requires immediate focus"
          badgeText={stats.overdueTaskCount > 0 ? 'Overdue Alert' : 'On Track'}
        />
      </div>

      {/* Developer Assigned Tasks (Sorted by Priority then Due Date) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              My Assigned Tasks (Priority & Due Date Sorted)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Change status directly from the dropdown to notify your Project Manager in real time.
            </p>
          </div>
          <Link
            to="/tasks"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
          >
            <span>Task View & Filters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingTasks ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading assigned tasks...</div>
        ) : myTasks.length === 0 ? (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
            You currently have no tasks assigned to you.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onTaskUpdated={handleTaskUpdated}
                canEditDetails={false} // Dev cannot edit task title/description/due date, only status
              />
            ))}
          </div>
        )}
      </div>

      {/* My Task Activity Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            My Task Activity Stream
          </h3>
          <span className="text-xs text-slate-400">
            Real-time feed filtered strictly to your assigned tasks
          </span>
        </div>
        <LiveActivityFeed limit={10} />
      </div>
    </div>
  );
};
