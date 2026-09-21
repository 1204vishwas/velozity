import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { PriorityBadge, OverdueBadge } from '../common/Badge';
import { tasksApi } from '../../api/tasks.api';
import { Calendar, User, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

export const TaskCard: React.FC<{
  task: Task;
  onTaskUpdated?: (updatedTask: Task) => void;
  onEdit?: (task: Task) => void;
  canEditDetails?: boolean;
}> = ({ task, onTaskUpdated, onEdit, canEditDetails = false }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    if (newStatus === task.status) return;

    setIsUpdatingStatus(true);
    try {
      const updated = await tasksApi.updateTaskStatus(task.id, newStatus);
      if (onTaskUpdated) {
        onTaskUpdated(updated);
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  let formattedDate = '';
  try {
    formattedDate = format(new Date(task.dueDate), 'MMM dd, yyyy');
  } catch {
    formattedDate = task.dueDate;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3 relative group">
      {/* Top row: Task number, priority, overdue */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold text-brand-400 bg-brand-950/60 px-2 py-0.5 rounded border border-brand-800/60">
            #{task.taskNumber}
          </span>
          <PriorityBadge priority={task.priority} />
          {task.isOverdue && <OverdueBadge />}
        </div>

        {canEditDetails && onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Edit Task Details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="text-sm font-semibold text-white leading-snug hover:text-brand-300 transition-colors">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Project & Due date */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 gap-2 border-t border-slate-800/60">
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className={task.isOverdue ? 'text-rose-400 font-medium' : 'text-slate-400'}>
            Due {formattedDate}
          </span>
        </div>

        {task.project?.name && (
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50 truncate max-w-[140px]">
            {task.project.name}
          </span>
        )}
      </div>

      {/* Bottom row: Assignee & Interactive Status selector */}
      <div className="flex items-center justify-between pt-1">
        {/* Assignee */}
        <div className="flex items-center space-x-2">
          {task.assignedTo ? (
            <div className="flex items-center space-x-1.5">
              <img
                src={
                  task.assignedTo.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    task.assignedTo.name
                  )}&background=0c87eb&color=fff`
                }
                alt={task.assignedTo.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-700"
              />
              <span className="text-xs text-slate-300 font-medium truncate max-w-[100px]">
                {task.assignedTo.name}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic flex items-center space-x-1">
              <User className="w-3.5 h-3.5" />
              <span>Unassigned</span>
            </span>
          )}
        </div>

        {/* Status Dropdown with live websocket triggering */}
        <div className="relative">
          <select
            value={task.status}
            onChange={handleStatusChange}
            disabled={isUpdatingStatus}
            className={`text-xs font-medium py-1 px-2.5 rounded-lg border focus:outline-none transition-all cursor-pointer ${
              task.status === 'DONE'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : task.status === 'IN_REVIEW'
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : task.status === 'IN_PROGRESS'
                ? 'bg-blue-950 text-blue-300 border-blue-800'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </div>
    </div>
  );
};
