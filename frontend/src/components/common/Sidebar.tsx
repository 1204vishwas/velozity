import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Activity,
  Briefcase,
  Shield,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = false,
  onClose,
}) => {
  const { user } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      to: '/',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'] as Role[],
    },
    {
      name: 'Projects',
      to: '/projects',
      icon: FolderKanban,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'] as Role[],
    },
    {
      name: 'Tasks',
      to: '/tasks',
      icon: CheckSquare,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'] as Role[],
    },
    {
      name: 'Live Activity Feed',
      to: '/activity',
      icon: Activity,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'] as Role[],
    },
    {
      name: 'Clients',
      to: '/clients',
      icon: Briefcase,
      roles: ['ADMIN', 'PROJECT_MANAGER'] as Role[],
    },
  ];

  const allowedNav = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 space-y-6">
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Navigation
            </p>
            <div className="space-y-1 pt-1">
              {allowedNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Role Access Scope Info Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span>Role Permissions</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {user?.role === 'ADMIN' &&
                'Full platform access: manage clients, projects, assign tasks, and view global activity.'}
              {user?.role === 'PROJECT_MANAGER' &&
                'Manage own projects and team tasks only. Cross-PM project isolation enforced.'}
              {user?.role === 'DEVELOPER' &&
                'Scoped exclusively to your assigned tasks. Status transitions recorded in real time.'}
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3 h-3 text-brand-400" />
            <span>Overdue Job: node-cron (1m)</span>
          </div>
          <span className="font-mono text-[10px] text-slate-600">v1.0</span>
        </div>
      </aside>
    </>
  );
};
