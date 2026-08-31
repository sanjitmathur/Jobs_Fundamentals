import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { deleteTask } from '../services/task.service';
import { prisma } from '../utils/db';
import { Role, TaskStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';

jest.mock('../utils/db', () => ({
  prisma: {
    task: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('TaskService.deleteTask authorization', () => {
  const sampleTask = {
    id: 'task-123',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.PENDING,
    userId: 'user-a',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow user A to delete their own task', async () => {
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
    (prisma.task.delete as jest.Mock).mockResolvedValue(sampleTask as never);

    await expect(deleteTask('task-123', 'user-a', Role.USER)).resolves.toBeUndefined();
    expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 'task-123' } });
  });

  it('should allow ADMIN to delete any user task', async () => {
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
    (prisma.task.delete as jest.Mock).mockResolvedValue(sampleTask as never);

    await expect(deleteTask('task-123', 'admin-user', Role.ADMIN)).resolves.toBeUndefined();
    expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 'task-123' } });
  });

  it('should reject when user B tries to delete user A task (403 Forbidden)', async () => {
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

    await expect(deleteTask('task-123', 'user-b', Role.USER)).rejects.toThrow(AppError);
    await expect(deleteTask('task-123', 'user-b', Role.USER)).rejects.toMatchObject({
      statusCode: 403,
      message: 'You do not have permission to delete this task',
    });
    expect(prisma.task.delete).not.toHaveBeenCalled();
  });

  it('should throw 404 when task is not found', async () => {
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(null as never);

    await expect(deleteTask('non-existent', 'user-a', Role.USER)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Task not found',
    });
    expect(prisma.task.delete).not.toHaveBeenCalled();
  });
});
