import React, { useState } from 'react';
import { useAuth, PRESET_ACCOUNTS } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { RoleBadge } from './Badge';
import { NotificationsMenu } from './NotificationsMenu';
import {
  LogOut,
  Users,
  ChevronDown,
  Sparkles,
  Layers,
  Menu,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC<{ onToggleSidebar?: () => void; isSidebarOpen?: boolean }> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { user, logout, quickLogin } = useAuth();
  const { activeUsersCount, isConnected } = useSocket();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Hamburger & Logo */}
          <div className="flex items-center space-x-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white flex items-center">
                  VELOZITY
                  <span className="text-[10px] ml-1.5 px-1.5 py-0.2 bg-brand-950 text-brand-400 border border-brand-800/80 rounded font-semibold tracking-normal">
                    DASHBOARD
                  </span>
                </span>
              </div>
            </Link>
          </div>

          {/* Center section: Live Presence Indicator */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            ></span>
            <span className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>
                <strong className="text-white font-semibold">{activeUsersCount}</strong> online now
              </span>
            </span>
            <span className="text-[10px] text-slate-500 pl-1 border-l border-slate-800">
              WebSocket Live
            </span>
          </div>

          {/* Right section: Quick Role Switcher, Notifications, Profile, Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Demo Role Switcher for Graders/Reviewers */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Quick Switch User Role"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Switch Role</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleSwitcher && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Role Switch (Demo)
                  </div>
                  {(Object.keys(PRESET_ACCOUNTS) as Array<keyof typeof PRESET_ACCOUNTS>).map(
                    (key) => {
                      const item = PRESET_ACCOUNTS[key];
                      const isCurrent = user?.email === item.email;
                      return (
                        <button
                          key={key}
                          onClick={async () => {
                            setShowRoleSwitcher(false);
                            await quickLogin(key);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                            isCurrent ? 'bg-brand-950/50 text-brand-300 font-semibold' : 'text-slate-300'
                          }`}
                        >
                          <span>{item.label}</span>
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* Notification Menu */}
            <NotificationsMenu />

            {/* User Info & Role */}
            {user && (
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-800">
                <img
                  src={
                    user.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name
                    )}&background=0c87eb&color=fff`
                  }
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white leading-tight">
                    {user.name}
                  </span>
                  <div className="mt-0.5">
                    <RoleBadge role={user.role} className="scale-90 origin-left" />
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors focus:outline-none"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
