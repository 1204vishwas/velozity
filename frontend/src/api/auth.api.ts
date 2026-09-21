import { apiClient, setAccessToken } from './client';
import { User, Role } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<{ accessToken: string; user: User }> => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { accessToken, user } = res.data.data;
    setAccessToken(accessToken);
    return { accessToken, user };
  },

  signup: async (data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }): Promise<{ accessToken: string; user: User }> => {
    const res = await apiClient.post('/auth/signup', data);
    const { accessToken, user } = res.data.data;
    setAccessToken(accessToken);
    return { accessToken, user };
  },

  socialLogin: async (data: {
    provider: 'google' | 'facebook';
    email: string;
    name: string;
    avatarUrl?: string;
    role?: Role;
  }): Promise<{ accessToken: string; user: User }> => {
    const res = await apiClient.post('/auth/social-login', data);
    const { accessToken, user } = res.data.data;
    setAccessToken(accessToken);
    return { accessToken, user };
  },

  refresh: async (): Promise<{ accessToken: string; user: User }> => {
    const res = await apiClient.post('/auth/refresh');
    const { accessToken, user } = res.data.data;
    setAccessToken(accessToken);
    return { accessToken, user };
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  me: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data.data;
  },

  getUsers: async (role?: string): Promise<User[]> => {
    const res = await apiClient.get('/auth/users', { params: { role } });
    return res.data.data;
  },
};
