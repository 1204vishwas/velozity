import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Activity, Clock, RefreshCw, Radio, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const LiveActivityFeed: React.FC<{ limit?: number; showHeader?: boolean }> = ({
  limit,
  showHeader = true,
}) => {
  const { activities, isConnected, refreshActivities } = useSocket();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const displayActivities = limit ? activities.slice(0, limit) : activities;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshActivities();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {showHeader && (
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-brand-950/70 text-brand-400 border border-brand-800/60">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Live Activity Feed</h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    isConnected
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                      : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                  }`}
                >
                  <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" />
                  {isConnected ? 'Real-Time Connected' : 'Connecting...'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user?.role === 'ADMIN' && 'Global feed across all client projects'}
                {user?.role === 'PROJECT_MANAGER' && 'Filtered to projects under your management'}
                {user?.role === 'DEVELOPER' && 'Filtered to tasks assigned directly to you'}
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700/80 transition-all disabled:opacity-50"
            title="Fetch missed offline events from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Missed</span>
          </button>
        </div>
      )}

      <div className="divide-y divide-slate-800/60 max-h-[560px] overflow-y-auto">
        {displayActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">No activity recorded yet</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Task movements and system status changes will stream here live.
            </p>
          </div>
        ) : (
          displayActivities.map((act) => {
            let timeAgo = '';
            try {
              timeAgo = formatDistanceToNow(new Date(act.createdAt), { addSuffix: true });
            } catch {
              timeAgo = 'just now';
            }

            const isOverdueAlert = act.action === 'TASK_OVERDUE';

            return (
              <div
                key={act.id}
                className="p-4 hover:bg-slate-800/40 transition-colors flex items-start space-x-3.5 group"
              >
                {/* User avatar or system alert icon */}
                {isOverdueAlert ? (
                  <div className="w-8 h-8 rounded-full bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                ) : act.user?.avatarUrl ? (
                  <img
                    src={act.user.avatarUrl}
                    alt={act.user.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700 flex-shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-950/80 border border-brand-800 flex items-center justify-center text-brand-300 font-bold text-xs flex-shrink-0 mt-0.5">
                    {(act.user?.name || act.userName || 'U')[0]}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-medium text-slate-200 leading-snug">
                      <span className="font-semibold text-white">
                        {act.message}
                      </span>
                    </p>
                    <span className="text-[11px] text-slate-500 whitespace-nowrap flex items-center space-x-1 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo}</span>
                    </span>
                  </div>

                  {/* Metadata tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {act.project?.name && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
                        {act.project.name}
                      </span>
                    )}
                    {act.fromStatus && act.toStatus && (
                      <span className="inline-flex items-center space-x-1 text-[10px] text-slate-400">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
                          {act.fromStatus}
                        </span>
                        <span>→</span>
                        <span className="px-1.5 py-0.2 rounded bg-brand-950/80 border border-brand-800 text-brand-300 font-medium">
                          {act.toStatus}
                        </span>
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 ml-auto font-mono">
                      DB-Backed Event
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
