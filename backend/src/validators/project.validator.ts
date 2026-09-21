import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

export const createProjectSchema = {
  body: z.object({
    name: z.string().min(2, 'Project name must be at least 2 characters'),
    description: z.string().optional(),
    clientId: z.string().min(1, 'Client ID is required'),
    managerId: z.string().optional(), // Admin can assign to any PM; if omitted or PM calling, defaults to current user
    status: z.nativeEnum(ProjectStatus).optional().default(ProjectStatus.ACTIVE),
  }),
};

export const updateProjectSchema = {
  params: z.object({
    id: z.string().min(1, 'Project ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    clientId: z.string().optional(),
    managerId: z.string().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
  }),
};
