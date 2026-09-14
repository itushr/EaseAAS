import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').transform((val) => val.toLowerCase().trim()),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .transform((val) => val.trim())
    .optional()
    .nullable(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required').transform((val) => val.trim()),
  password: z.string().min(1, 'Password is required'),
});

export const setUsernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .transform((val) => val.trim()),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SetUsernameInput = z.infer<typeof setUsernameSchema>;

export function validateRegister(data: unknown): RegisterInput {
  return registerSchema.parse(data);
}

export function validateLogin(data: unknown): LoginInput {
  return loginSchema.parse(data);
}

export function validateSetUsername(data: unknown): SetUsernameInput {
  return setUsernameSchema.parse(data);
}
