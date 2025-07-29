// lib/validators.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']),
  employeeId: z.string().optional(),
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']).optional(),
  employeeId: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const bulkImportSchema = z.object({
  users: z.array(createUserSchema).min(1, 'At least one user is required').max(50, 'Maximum 50 users per batch')
});
