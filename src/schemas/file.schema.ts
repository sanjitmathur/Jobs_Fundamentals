import { z } from 'zod';

export const taskIdParamSchema = z.object({
  params: z
    .object({
      id: z.string().uuid('Invalid task ID format').optional(),
      taskId: z.string().uuid('Invalid task ID format').optional(),
    })
    .refine((data) => Boolean(data.id || data.taskId), {
      message: 'Task ID is required and must be a valid UUID',
    }),
});

export const fileIdParamSchema = z.object({
  params: z
    .object({
      id: z.string().uuid('Invalid task ID format').optional(),
      taskId: z.string().uuid('Invalid task ID format').optional(),
      fileId: z.string().uuid('Invalid file ID format'),
    })
    .refine((data) => Boolean(data.id || data.taskId), {
      message: 'Task ID is required and must be a valid UUID',
    }),
});
