import { apiClient } from './client';
import { Client } from '../types';

export const clientsApi = {
  getClients: async (): Promise<Client[]> => {
    const res = await apiClient.get('/clients');
    return res.data.data;
  },

  createClient: async (data: {
    name: string;
    company: string;
    email: string;
    phone?: string;
  }): Promise<Client> => {
    const res = await apiClient.post('/clients', data);
    return res.data.data;
  },

  deleteClient: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },
};
