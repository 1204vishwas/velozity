import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, AlertTriangle, Layers, UserCheck } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';

export const NotificationsMenu: React.FC = () => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useSocket();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'TASK_IN_REVIEW':
        return <Layers className="w-4 h-4 text-amber-400" />;
      case 'TASK_OVERDUE':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-rose-600 rounded-full animate-pulse shadow-md">
            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-slate-200">Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-950 text-brand-400 border border-brand-800 font-medium">
                  {unreadNotificationCount} unread
                </span>
              )}
            </div>
            {unreadNotificationCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center space-x-1 font-medium hover:underline transition-all"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => {
                let timeAgo = '';
                try {
                  timeAgo = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true });
                } catch {
                  timeAgo = 'recently';
                }

                return (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markNotificationAsRead(n.id)}
                    className={`p-3.5 flex items-start space-x-3 transition-colors cursor-pointer hover:bg-slate-800/60 ${
                      !n.isRead ? 'bg-slate-800/30' : 'opacity-75'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 flex-shrink-0 mt-0.5">
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs font-semibold truncate ${
                            !n.isRead ? 'text-white' : 'text-slate-300'
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      <div className="flex items-center space-x-1 text-[10px] text-slate-500 mt-1.5">
                        <Clock className="w-3 h-3" />
                        <span>{timeAgo}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
