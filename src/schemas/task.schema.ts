import { z } from 'zod';

const TaskStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']);

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: TaskStatusEnum,
  }),
});
