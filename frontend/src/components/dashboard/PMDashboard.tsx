import React from 'react';
import { PMDashboardStats } from '../../types';
import { MetricsCard } from './MetricsCard';
import { LiveActivityFeed } from '../activity/LiveActivityFeed';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  FolderKanban,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export const PMDashboard: React.FC<{ stats: PMDashboardStats }> = ({ stats }) => {
  const priorities = stats.tasksByPriority || {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top 3 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricsCard
          title="My Managed Projects"
          value={stats.myProjectsCount}
          icon={FolderKanban}
          color="brand"
          subtext="Projects you created & manage"
          badgeText="PM Scoped"
        />

        <MetricsCard
          title="Critical & High Tasks"
          value={(priorities.CRITICAL || 0) + (priorities.HIGH || 0)}
          icon={Flame}
          color="amber"
          subtext={`${priorities.CRITICAL} Critical, ${priorities.HIGH} High`}
          badgeText="Priority Focus"
        />

        <MetricsCard
          title="Overdue In Team"
          value={stats.overdueTaskCount}
          icon={AlertTriangle}
          color="rose"
          subtext="Tasks past due in your projects"
          badgeText={stats.overdueTaskCount > 0 ? 'Action Needed' : 'On Track'}
        />
      </div>

      {/* Tasks by Priority & Projects Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks by Priority Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Tasks by Priority</span>
          </h3>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-lg bg-rose-950/40 border border-rose-900/40">
              <span className="text-xs font-semibold text-rose-300">Critical Priority</span>
              <span className="text-sm font-bold text-white">{priorities.CRITICAL}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-950/40 border border-orange-900/40">
              <span className="text-xs font-semibold text-orange-300">High Priority</span>
              <span className="text-sm font-bold text-white">{priorities.HIGH}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-950/40 border border-cyan-900/40">
              <span className="text-xs font-semibold text-cyan-300">Medium Priority</span>
              <span className="text-sm font-bold text-white">{priorities.MEDIUM}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Low Priority</span>
              <span className="text-sm font-bold text-white">{priorities.LOW}</span>
            </div>
          </div>
        </div>

        {/* Managed Projects Summary List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <FolderKanban className="w-4 h-4 text-brand-400" />
              <span>My Projects Summary</span>
            </h3>
            <Link
              to="/projects"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {stats.projects.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No projects assigned yet.</p>
            ) : (
              stats.projects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                    <span className="text-[10px] text-slate-400 mt-0.5 inline-block">
                      Status: {p.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-slate-300">
                      {p._count.tasks} tasks
                    </span>
                    <Link
                      to={`/projects/${p.id}`}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-brand-600 transition-all"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Due Dates This Week */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-brand-400" />
          <span>Upcoming Due Dates This Week</span>
        </h3>

        {stats.upcomingDueDatesThisWeek.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No tasks due this week.</p>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {stats.upcomingDueDatesThisWeek.map((task) => {
              let formatted = '';
              try {
                formatted = format(new Date(task.dueDate), 'EEE, MMM dd');
              } catch {
                formatted = task.dueDate;
              }

              return (
                <div
                  key={task.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold text-brand-400 bg-brand-950/60 px-2 py-0.5 rounded border border-brand-800/60">
                      #{task.taskNumber}
                    </span>
                    <span className="text-xs font-medium text-white">{task.title}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    {task.assignedTo && (
                      <span className="text-slate-400 text-[11px]">
                        Assignee: <strong className="text-slate-200">{task.assignedTo.name}</strong>
                      </span>
                    )}
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {formatted}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Team Activity Scoped Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Team Real-Time Activity Feed
          </h3>
          <span className="text-xs text-slate-400">Filtered strictly to your managed projects</span>
        </div>
        <LiveActivityFeed limit={10} />
      </div>
    </div>
  );
};
