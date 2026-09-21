import { apiClient } from './client';
import { ActivityLog } from '../types';

export const activityApi = {
  getActivities: async (limit: number = 20): Promise<ActivityLog[]> => {
    const res = await apiClient.get('/activity', { params: { limit } });
    return res.data.data;
  },
};
