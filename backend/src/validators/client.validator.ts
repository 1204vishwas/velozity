import { z } from 'zod';

export const createClientSchema = {
  body: z.object({
    name: z.string().min(2, 'Client name is required'),
    company: z.string().min(2, 'Company name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional().nullable(),
  }),
};

export const updateClientSchema = {
  params: z.object({
    id: z.string().min(1, 'Client ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    company: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional().nullable(),
  }),
};
