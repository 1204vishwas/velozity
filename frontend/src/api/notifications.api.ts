import { apiClient } from './client';
import { Notification } from '../types';

export const notificationsApi = {
  getNotifications: async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
    const res = await apiClient.get('/notifications');
    return res.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get('/notifications/unread-count');
    return res.data.data.count;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },
};
