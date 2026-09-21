import { z } from 'zod';
import { Role } from '@prisma/client';

export const loginSchema = {
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
};

export const signupSchema = {
  body: z.object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.nativeEnum(Role).optional().default(Role.DEVELOPER),
  }),
};

export const socialLoginSchema = {
  body: z.object({
    provider: z.enum(['google', 'facebook']),
    email: z.string().email('Valid email is required'),
    name: z.string().min(1, 'Name is required'),
    avatarUrl: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
  }),
};
