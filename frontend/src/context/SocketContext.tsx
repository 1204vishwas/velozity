import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { ActivityLog, Notification } from '../types';
import { notificationsApi } from '../api/notifications.api';
import { activityApi } from '../api/activity.api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeUsersCount: number;
  onlineUserIds: string[];
  activities: ActivityLog[];
  notifications: Notification[];
  unreadNotificationCount: number;
  joinProjectRoom: (projectId: string) => void;
  leaveProjectRoom: (projectId: string) => void;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  refreshActivities: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeUsersCount, setActiveUsersCount] = useState<number>(0);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);

  // Fetch initial missed events (last 20 from DB) and notifications when user logs in
  const fetchInitialData = useCallback(async () => {
    if (!user) return;
    try {
      const [activityLogs, notifsData] = await Promise.all([
        activityApi.getActivities(20),
        notificationsApi.getNotifications(),
      ]);
      setActivities(activityLogs);
      setNotifications(notifsData.notifications);
      setUnreadNotificationCount(notifsData.unreadCount);
    } catch (err) {
      console.error('Error fetching initial activity or notification data:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user && token) {
      fetchInitialData();
    } else {
      setActivities([]);
      setNotifications([]);
      setUnreadNotificationCount(0);
      setActiveUsersCount(0);
    }
  }, [user, token, fetchInitialData]);

  // Establish WebSocket connection
  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const s: Socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    s.on('connect', () => {
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time presence listener
    s.on('presence:update', (data: { activeCount: number; onlineUserIds: string[] }) => {
      setActiveUsersCount(data.activeCount);
      setOnlineUserIds(data.onlineUserIds);
    });

    // Real-time activity feed listener
    s.on('activity:new', (newActivity: any) => {
      setActivities((prev) => {
        // Prevent duplicates
        if (prev.some((a) => a.id === newActivity.id)) {
          return prev;
        }
        return [newActivity, ...prev].slice(0, 50);
      });
    });

    // Real-time notifications
    s.on('notification:new', (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadNotificationCount((prev) => prev + 1);
    });

    s.on('notification:unread_count', (data: { count: number }) => {
      setUnreadNotificationCount(data.count);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user?.id, token]);

  const joinProjectRoom = useCallback(
    (projectId: string) => {
      if (socket && isConnected && projectId) {
        socket.emit('project:join', projectId);
      }
    },
    [socket, isConnected]
  );

  const leaveProjectRoom = useCallback(
    (projectId: string) => {
      if (socket && isConnected && projectId) {
        socket.emit('project:leave', projectId);
      }
    },
    [socket, isConnected]
  );

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotificationCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activeUsersCount,
        onlineUserIds,
        activities,
        notifications,
        unreadNotificationCount,
        joinProjectRoom,
        leaveProjectRoom,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshActivities: fetchInitialData,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
