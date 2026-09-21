import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const createTaskSchema = {
  body: z.object({
    title: z.string().min(2, 'Task title is required'),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
    priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid due date string is required (ISO format)',
    }),
    projectId: z.string().min(1, 'Project ID is required'),
    assignedToId: z.string().optional().nullable(),
  }),
};

export const updateTaskDetailsSchema = {
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Valid due date string is required (ISO format)',
      })
      .optional(),
    assignedToId: z.string().optional().nullable(),
    status: z.nativeEnum(TaskStatus).optional(),
  }),
};

export const updateTaskStatusSchema = {
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    status: z.nativeEnum(TaskStatus, {
      required_error: 'Status is required (TODO, IN_PROGRESS, IN_REVIEW, DONE)',
    }),
  }),
};

export const taskQueryFilterSchema = {
  query: z.object({
    status: z.string().optional(),
    priority: z.string().optional(),
    dueStart: z.string().optional(),
    dueEnd: z.string().optional(),
    projectId: z.string().optional(),
    isOverdue: z.string().optional(),
    assignedToId: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
};
