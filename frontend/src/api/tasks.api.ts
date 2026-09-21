import { apiClient } from './client';
import { Task, TaskStatus, TaskPriority, TaskFilterParams } from '../types';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate: string;
  projectId: string;
  assignedToId?: string | null;
}

export const tasksApi = {
  getTasks: async (filters?: TaskFilterParams): Promise<Task[]> => {
    const params: Record<string, any> = {};
    if (filters) {
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.dueStart) params.dueStart = filters.dueStart;
      if (filters.dueEnd) params.dueEnd = filters.dueEnd;
      if (filters.projectId) params.projectId = filters.projectId;
      if (filters.isOverdue !== undefined && filters.isOverdue !== '') {
        params.isOverdue = filters.isOverdue;
      }
      if (filters.search) params.search = filters.search;
    }

    const res = await apiClient.get('/tasks', { params });
    return res.data.data;
  },

  getTaskById: async (id: string): Promise<Task> => {
    const res = await apiClient.get(`/tasks/${id}`);
    return res.data.data;
  },

  createTask: async (data: CreateTaskPayload): Promise<Task> => {
    const res = await apiClient.post('/tasks', data);
    return res.data.data;
  },

  updateTaskDetails: async (
    id: string,
    data: Partial<CreateTaskPayload>
  ): Promise<Task> => {
    const res = await apiClient.put(`/tasks/${id}`, data);
    return res.data.data;
  },

  updateTaskStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    const res = await apiClient.patch(`/tasks/${id}/status`, { status });
    return res.data.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
