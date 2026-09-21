import React from 'react';
import { LiveActivityFeed } from '../components/activity/LiveActivityFeed';
import { useAuth } from '../context/AuthContext';
import { Activity, Radio, ShieldCheck, Database } from 'lucide-react';

export const ActivityFeedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
          <Activity className="w-6 h-6 text-brand-500" />
          <span>Real-Time Activity Feed</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Live WebSocket updates on task transitions, assignments, and automated system alerts.
        </p>
      </div>

      {/* Information Cards on Assessment Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400">
            <Radio className="w-3.5 h-3.5" />
            <span>WebSocket Live Stream</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Status updates trigger instantaneous broadcasts to project rooms and role-targeted sockets.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Filtered Scoping</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {user?.role === 'ADMIN' && 'Currently showing all activity across every agency project.'}
            {user?.role === 'PROJECT_MANAGER' && 'Currently showing activity only for your managed projects.'}
            {user?.role === 'DEVELOPER' && 'Currently showing activity strictly on tasks assigned to you.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
            <Database className="w-3.5 h-3.5" />
            <span>DB-Backed Catchup</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Offline catchup loads the last 20 events from PostgreSQL, not ephemeral in-memory caches.
          </p>
        </div>
      </div>

      {/* Feed Component */}
      <LiveActivityFeed showHeader={true} />
    </div>
  );
};
