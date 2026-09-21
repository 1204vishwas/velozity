import { apiClient } from './client';
import { DashboardStats } from '../types';

export const analyticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get('/analytics/dashboard');
    return res.data.data;
  },
};
