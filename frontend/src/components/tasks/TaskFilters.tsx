import React, { useState } from 'react';
import { useTaskFilters } from '../../hooks/useTaskFilters';
import { Search, X, AlertTriangle, Link2, Check } from 'lucide-react';

export const TaskFilters: React.FC = () => {
  const { filters, setFilter, resetFilters, activeFilterCount } = useTaskFilters();
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={filters.search || ''}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Action / Reset / Share URL */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters ({activeFilterCount})</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all shadow-sm"
            title="Copy URL with current filter query parameters"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Share URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Row: Status, Priority, Overdue, Date range */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
        {/* Status */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => setFilter('status', e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Priority</label>
          <select
            value={filters.priority || ''}
            onChange={(e) => setFilter('priority', e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Due Date Start */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Due From</label>
          <input
            type="date"
            value={filters.dueStart || ''}
            onChange={(e) => setFilter('dueStart', e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Due Date End */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Due Until</label>
          <input
            type="date"
            value={filters.dueEnd || ''}
            onChange={(e) => setFilter('dueEnd', e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Overdue Only toggle */}
        <div className="flex items-end">
          <button
            onClick={() => setFilter('isOverdue', filters.isOverdue === true ? '' : true)}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center space-x-1.5 transition-all ${
              filters.isOverdue === true
                ? 'bg-rose-950 text-rose-300 border-rose-700 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Overdue Only</span>
          </button>
        </div>
      </div>
    </div>
  );
};
