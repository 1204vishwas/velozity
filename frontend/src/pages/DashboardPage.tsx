import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../api/analytics.api';
import { DashboardStats, AdminDashboardStats, PMDashboardStats, DeveloperDashboardStats } from '../types';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { PMDashboard } from '../components/dashboard/PMDashboard';
import { DeveloperDashboard } from '../components/dashboard/DeveloperDashboard';
import { RoleBadge } from '../components/common/Badge';
import { RefreshCw } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.role]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Dashboard Overview
            </h1>
            {user && <RoleBadge role={user.role} />}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Welcome back, <strong className="text-white">{user?.name}</strong>. Here is your operational telemetry.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-850 hover:bg-slate-800 hover:text-white border border-slate-800 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          Loading telemetry and dashboard analytics...
        </div>
      ) : !stats ? (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
          Failed to load dashboard metrics. Please retry.
        </div>
      ) : (
        <>
          {user?.role === 'ADMIN' && (
            <AdminDashboard stats={stats as AdminDashboardStats} />
          )}
          {user?.role === 'PROJECT_MANAGER' && (
            <PMDashboard stats={stats as PMDashboardStats} />
          )}
          {user?.role === 'DEVELOPER' && (
            <DeveloperDashboard stats={stats as DeveloperDashboardStats} />
          )}
        </>
      )}
    </div>
  );
};
