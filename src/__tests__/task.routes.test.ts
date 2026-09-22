import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { prisma } from '../utils/db';
import { Role, TaskStatus } from '@prisma/client';

jest.mock('../utils/db', () => ({
  prisma: {
    task: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

const generateToken = (userId: string, role: Role) => {
  return jwt.sign({ userId, role }, JWT_SECRET);
};

describe('DELETE /api/tasks/:id route authorization', () => {
  const sampleTask = {
    id: 'task-123',
    title: 'User A Task',
    description: 'Description',
    status: TaskStatus.PENDING,
    userId: 'user-a-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).delete('/api/tasks/task-123');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  it('should allow user A to delete their own task (204 No Content)', async () => {
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
    (prisma.task.delete as jest.Mock).mockResolvedValue(sampleTask as never);

    const userAToken = generateToken('user-a-id', Role.USER);

    const res = await request(app)
      .delete('/api/tasks/task-123')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(204);
    expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 'task-123' } });
  });

  it('should forbid user B from deleting user A task (403 Forbidden)', async () => {
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

    const userBToken = generateToken('user-b-id', Role.USER);

    const res = await request(app)
      .delete('/api/tasks/task-123')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('You do not have permission to delete this task');
    expect(prisma.task.delete).not.toHaveBeenCalled();
  });

  it('should allow ADMIN to delete user A task (204 No Content)', async () => {
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
    (prisma.task.delete as jest.Mock).mockResolvedValue(sampleTask as never);

    const adminToken = generateToken('admin-id', Role.ADMIN);

    const res = await request(app)
      .delete('/api/tasks/task-123')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
    expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 'task-123' } });
  });
});

describe('GET /api/tasks route scoping', () => {
  it('should filter tasks by userId for regular users', async () => {
    (prisma.task.findMany as jest.Mock).mockResolvedValue([] as never);
    (prisma.task.count as jest.Mock).mockResolvedValue(0 as never);

    const userToken = generateToken('user-123', Role.USER);

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-123',
        }),
      })
    );
  });
});
