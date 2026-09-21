import React from 'react';
import { AdminDashboardStats } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { MetricsCard } from './MetricsCard';
import { LiveActivityFeed } from '../activity/LiveActivityFeed';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC<{ stats: AdminDashboardStats }> = ({ stats }) => {
  const { activeUsersCount } = useSocket();

  // Use live activeUsersCount from WebSocket if available
  const liveOnline = activeUsersCount > 0 ? activeUsersCount : stats.activeUsersOnline;

  const totalTasks = stats.totalTasks || 1;
  const statusCounts = stats.tasksByStatus || {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top 4 Metrics Required by Specification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={FolderKanban}
          color="brand"
          subtext="Active client engagements"
          badgeText="Active"
        />

        <MetricsCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={CheckCircle2}
          color="purple"
          subtext={`${statusCounts.DONE} tasks completed`}
          badgeText={`${Math.round((statusCounts.DONE / totalTasks) * 100)}% done`}
        />

        <MetricsCard
          title="Overdue Tasks"
          value={stats.overdueTaskCount}
          icon={AlertTriangle}
          color="rose"
          subtext="Flagged via node-cron scheduler"
          badgeText={stats.overdueTaskCount > 0 ? 'Requires Action' : 'All on Track'}
        />

        <MetricsCard
          title="Active Users Online"
          value={liveOnline}
          icon={Users}
          color="emerald"
          subtext="Live WebSocket presence tracking"
          badgeText="Live Presence"
        />
      </div>

      {/* Task Status Breakdown Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Clock className="w-4 h-4 text-brand-400" />
            <span>Tasks by Status</span>
          </h3>
          <Link
            to="/tasks"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1 transition-colors"
          >
            <span>View All Tasks</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/tasks?status=TODO"
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all group"
          >
            <span className="text-xs font-medium text-slate-400">To Do</span>
            <p className="text-2xl font-extrabold text-white mt-1 group-hover:text-brand-300 transition-colors">
              {statusCounts.TODO}
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-slate-500 h-full rounded-full"
                style={{ width: `${(statusCounts.TODO / totalTasks) * 100}%` }}
              ></div>
            </div>
          </Link>

          <Link
            to="/tasks?status=IN_PROGRESS"
            className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/40 hover:border-blue-700/60 transition-all group"
          >
            <span className="text-xs font-medium text-blue-300">In Progress</span>
            <p className="text-2xl font-extrabold text-white mt-1 group-hover:text-blue-300 transition-colors">
              {statusCounts.IN_PROGRESS}
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${(statusCounts.IN_PROGRESS / totalTasks) * 100}%` }}
              ></div>
            </div>
          </Link>

          <Link
            to="/tasks?status=IN_REVIEW"
            className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/40 hover:border-amber-700/60 transition-all group"
          >
            <span className="text-xs font-medium text-amber-300">In Review</span>
            <p className="text-2xl font-extrabold text-white mt-1 group-hover:text-amber-300 transition-colors">
              {statusCounts.IN_REVIEW}
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${(statusCounts.IN_REVIEW / totalTasks) * 100}%` }}
              ></div>
            </div>
          </Link>

          <Link
            to="/tasks?status=DONE"
            className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40 hover:border-emerald-700/60 transition-all group"
          >
            <span className="text-xs font-medium text-emerald-300">Done</span>
            <p className="text-2xl font-extrabold text-white mt-1 group-hover:text-emerald-300 transition-colors">
              {statusCounts.DONE}
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${(statusCounts.DONE / totalTasks) * 100}%` }}
              ></div>
            </div>
          </Link>
        </div>
      </div>

      {/* Global Real-Time Activity Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Agency Real-Time Activity Stream
          </h3>
          <span className="text-xs text-slate-400">
            Live WebSocket updates across all projects
          </span>
        </div>
        <LiveActivityFeed limit={15} />
      </div>
    </div>
  );
};
