import React from 'react';
import { TaskStatus, TaskPriority, Role } from '../../types';

export const StatusBadge: React.FC<{ status: TaskStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const styles: Record<TaskStatus, { bg: string; text: string; label: string; border: string }> = {
    TODO: {
      bg: 'bg-slate-800/80',
      text: 'text-slate-300',
      border: 'border-slate-700',
      label: 'To Do',
    },
    IN_PROGRESS: {
      bg: 'bg-blue-950/70',
      text: 'text-blue-400',
      border: 'border-blue-800/60',
      label: 'In Progress',
    },
    IN_REVIEW: {
      bg: 'bg-amber-950/70',
      text: 'text-amber-400',
      border: 'border-amber-800/60',
      label: 'In Review',
    },
    DONE: {
      bg: 'bg-emerald-950/70',
      text: 'text-emerald-400',
      border: 'border-emerald-800/60',
      label: 'Done',
    },
  };

  const item = styles[status] || styles.TODO;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.bg} ${item.text} ${item.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {item.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority; className?: string }> = ({
  priority,
  className = '',
}) => {
  const styles: Record<TaskPriority, { bg: string; text: string; border: string }> = {
    LOW: {
      bg: 'bg-slate-800/60',
      text: 'text-slate-400',
      border: 'border-slate-700/50',
    },
    MEDIUM: {
      bg: 'bg-cyan-950/60',
      text: 'text-cyan-400',
      border: 'border-cyan-800/50',
    },
    HIGH: {
      bg: 'bg-orange-950/60',
      text: 'text-orange-400',
      border: 'border-orange-800/50',
    },
    CRITICAL: {
      bg: 'bg-rose-950/80',
      text: 'text-rose-300 font-semibold',
      border: 'border-rose-700/80',
    },
  };

  const item = styles[priority] || styles.MEDIUM;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${item.bg} ${item.text} ${item.border} ${className}`}
    >
      {priority}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: Role; className?: string }> = ({
  role,
  className = '',
}) => {
  const styles: Record<Role, { bg: string; text: string; border: string; label: string }> = {
    ADMIN: {
      bg: 'bg-purple-950/70',
      text: 'text-purple-300',
      border: 'border-purple-700/60',
      label: 'Admin',
    },
    PROJECT_MANAGER: {
      bg: 'bg-indigo-950/70',
      text: 'text-indigo-300',
      border: 'border-indigo-700/60',
      label: 'Project Manager',
    },
    DEVELOPER: {
      bg: 'bg-emerald-950/70',
      text: 'text-emerald-300',
      border: 'border-emerald-700/60',
      label: 'Developer',
    },
  };

  const item = styles[role] || styles.DEVELOPER;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide border ${item.bg} ${item.text} ${item.border} ${className}`}
    >
      {item.label}
    </span>
  );
};

export const OverdueBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-950 text-red-300 border border-red-700 animate-pulse ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5"></span>
      OVERDUE
    </span>
  );
};
