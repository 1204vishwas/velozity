import { apiClient } from './client';
import { Project, ProjectStatus } from '../types';

export interface CreateProjectPayload {
  name: string;
  description?: string;
  clientId: string;
  managerId?: string;
  status?: ProjectStatus;
}

export const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    const res = await apiClient.get('/projects');
    return res.data.data;
  },

  getProjectById: async (id: string): Promise<Project> => {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data.data;
  },

  createProject: async (data: CreateProjectPayload): Promise<Project> => {
    const res = await apiClient.post('/projects', data);
    return res.data.data;
  },

  updateProject: async (id: string, data: Partial<CreateProjectPayload>): Promise<Project> => {
    const res = await apiClient.put(`/projects/${id}`, data);
    return res.data.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
