import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Readable } from 'stream';
import app from '../app';
import { prisma } from '../utils/db';
import { getStorageProvider } from '../storage';
import { Role, TaskStatus } from '@prisma/client';

jest.mock('../utils/db', () => ({
  prisma: {
    task: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    file: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('../storage', () => {
  const mockStorage = {
    saveFile: jest.fn(),
    getFileStream: jest.fn(),
    getFileBuffer: jest.fn(),
    deleteFile: jest.fn(),
    fileExists: jest.fn(),
  };
  return {
    getStorageProvider: jest.fn(() => mockStorage),
    setStorageProvider: jest.fn(),
  };
});

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

const generateToken = (userId: string, role: Role) => {
  return jwt.sign({ userId, role }, JWT_SECRET);
};

describe('File Routes Integration Tests (/api/tasks/:id/files)', () => {
  const validTaskId = '11111111-1111-4111-8111-111111111111';
  const validFileId = '33333333-3333-4333-8333-333333333333';
  const userAId = '44444444-4444-4444-8444-444444444444';
  const userBId = '55555555-5555-4555-8555-555555555555';
  const adminId = '66666666-6666-4666-8666-666666666666';

  const userAToken = generateToken(userAId, Role.USER);
  const userBToken = generateToken(userBId, Role.USER);
  const adminToken = generateToken(adminId, Role.ADMIN);

  const sampleTask = {
    id: validTaskId,
    title: 'Test Task',
    description: 'Task description',
    status: TaskStatus.PENDING,
    userId: userAId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const validPdfBuffer = Buffer.from('%PDF-1.4 sample content');

  const sampleFileDbRecord = {
    id: validFileId,
    originalName: 'test-doc.pdf',
    storageKey: 'unique-safe-uuid.pdf',
    mimeType: 'application/pdf',
    size: validPdfBuffer.length,
    createdAt: new Date(),
    updatedAt: new Date(),
    taskId: validTaskId,
    uploadedById: userAId,
    task: sampleTask,
  };

  const sampleFilePublicRecord = {
    id: validFileId,
    originalName: 'test-doc.pdf',
    mimeType: 'application/pdf',
    size: validPdfBuffer.length,
    createdAt: new Date(),
    updatedAt: new Date(),
    taskId: validTaskId,
    uploadedById: userAId,
  };

  const mockStorage = getStorageProvider() as jest.Mocked<ReturnType<typeof getStorageProvider>>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication & Parameter Validation', () => {
    it('should return 401 Unauthorized when no auth token is provided', async () => {
      const res = await request(app).get(`/api/tasks/${validTaskId}/files`);
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/token/i);
    });

    it('should return 400 Bad Request when taskId is not a valid UUID', async () => {
      const res = await request(app)
        .get('/api/tasks/not-a-valid-uuid/files')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should return 400 Bad Request when fileId is not a valid UUID', async () => {
      const res = await request(app)
        .get(`/api/tasks/${validTaskId}/files/invalid-file-uuid`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/tasks/:id/files (Single Upload)', () => {
    it('should successfully upload a valid file to an owned task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (mockStorage.saveFile as jest.Mock).mockResolvedValue(undefined as never);
      (prisma.file.create as jest.Mock).mockResolvedValue(sampleFilePublicRecord as never);

      const res = await request(app)
        .post(`/api/tasks/${validTaskId}/files`)
        .set('Authorization', `Bearer ${userAToken}`)
        .attach('file', validPdfBuffer, 'test-doc.pdf');

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(validFileId);
      expect(res.body.originalName).toBe('test-doc.pdf');
      expect(res.body.storageKey).toBeUndefined();
    });

    it('should allow ADMIN to upload a file to another user task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (mockStorage.saveFile as jest.Mock).mockResolvedValue(undefined as never);
      (prisma.file.create as jest.Mock).mockResolvedValue({
        ...sampleFilePublicRecord,
        uploadedById: adminId,
      } as never);

      const res = await request(app)
        .post(`/api/tasks/${validTaskId}/files`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', validPdfBuffer, 'test-doc.pdf');

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(validFileId);
    });

    it('should return 403 when user B tries to upload to user A task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

      const res = await request(app)
        .post(`/api/tasks/${validTaskId}/files`)
        .set('Authorization', `Bearer ${userBToken}`)
        .attach('file', validPdfBuffer, 'test-doc.pdf');

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('You do not have permission to upload files for this task');
    });

    it('should return 404 when uploading to a non-existent task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null as never);

      const res = await request(app)
        .post(`/api/tasks/${validTaskId}/files`)
        .set('Authorization', `Bearer ${userAToken}`)
        .attach('file', validPdfBuffer, 'test-doc.pdf');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Task not found');
    });

    it('should return 400 when no file is attached in request', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

      const res = await request(app)
        .post(`/api/tasks/${validTaskId}/files`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('File is required');
    });

    it('should return 400 when file is empty (0 bytes)', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

      const res = await request(app)
        .post(`/api/tasks/${validTaskId}/files`)
        .set('Authorization', `Bearer ${userAToken}`)
        .attach('file', Buffer.alloc(0), 'empty.txt');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('File cannot be empty');
    });

    it('should return 400 when file has unsupported type (.exe)', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

      const res = await request(app)
        .post(`/api/tasks/${validTaskId}/files`)
        .set('Authorization', `Bearer ${userAToken}`)
        .attach('file', Buffer.from('MZ...binary'), 'malware.exe');

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/unsupported/i);
    });

    it('should return 400 when file signature (magic bytes) does not match declared type', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

      const fakePdfBuffer = Buffer.from('NOT_A_REAL_PDF_HEADER');

      const res = await request(app)
        .post(`/api/tasks/${validTaskId}/files`)
        .set('Authorization', `Bearer ${userAToken}`)
        .attach('file', fakePdfBuffer, 'fake.pdf');

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/file signature mismatch/i);
    });
  });

  describe('POST /api/tasks/:id/files/batch (Multiple Upload)', () => {
    it('should upload multiple valid files', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (mockStorage.saveFile as jest.Mock).mockResolvedValue(undefined as never);
      (prisma.file.create as jest.Mock).mockResolvedValue(sampleFilePublicRecord as never);

      const res = await request(app)
        .post(`/api/tasks/${validTaskId}/files/batch`)
        .set('Authorization', `Bearer ${userAToken}`)
        .attach('files', validPdfBuffer, 'file1.pdf')
        .attach('files', Buffer.from('hello plain text'), 'file2.txt');

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('should return 400 when no files are provided in batch upload', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

      const res = await request(app)
        .post(`/api/tasks/${validTaskId}/files/batch`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('At least one file is required');
    });
  });

  describe('GET /api/tasks/:id/files (List Files)', () => {
    it('should return list of files for owned task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findMany as jest.Mock).mockResolvedValue([sampleFilePublicRecord] as never);

      const res = await request(app)
        .get(`/api/tasks/${validTaskId}/files`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].id).toBe(validFileId);
      expect(res.body[0].storageKey).toBeUndefined();
    });

    it('should allow ADMIN to list files for any task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findMany as jest.Mock).mockResolvedValue([sampleFilePublicRecord] as never);

      const res = await request(app)
        .get(`/api/tasks/${validTaskId}/files`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('should return 403 when user B tries to list user A task files', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

      const res = await request(app)
        .get(`/api/tasks/${validTaskId}/files`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('You do not have permission to view files for this task');
    });
  });

  describe('GET /api/tasks/:id/files/:fileId (Get File Metadata)', () => {
    it('should return file metadata for owned task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findUnique as jest.Mock).mockResolvedValue(sampleFilePublicRecord as never);

      const res = await request(app)
        .get(`/api/tasks/${validTaskId}/files/${validFileId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(validFileId);
      expect(res.body.originalName).toBe('test-doc.pdf');
      expect(res.body.storageKey).toBeUndefined();
    });

    it('should return 404 when file is not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findUnique as jest.Mock).mockResolvedValue(null as never);

      const res = await request(app)
        .get(`/api/tasks/${validTaskId}/files/${validFileId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('File not found');
    });

    it('should return 403 when user B tries to access user A file metadata', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

      const res = await request(app)
        .get(`/api/tasks/${validTaskId}/files/${validFileId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('You do not have permission to view this file');
    });
  });

  describe('GET /api/tasks/:id/files/:fileId/download (Download File)', () => {
    it('should stream file download with correct headers', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findUnique as jest.Mock).mockResolvedValue(sampleFileDbRecord as never);
      const stream = Readable.from([validPdfBuffer]);
      (mockStorage.getFileStream as jest.Mock).mockResolvedValue(stream as never);

      const res = await request(app)
        .get(`/api/tasks/${validTaskId}/files/${validFileId}/download`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toMatch(/application\/pdf/);
      expect(res.header['content-disposition']).toMatch(/attachment/);
      expect(res.header['content-disposition']).toMatch(/test-doc\.pdf/);
      expect(res.body).toEqual(validPdfBuffer);
    });

    it('should return 403 when user B tries to download user A file', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

      const res = await request(app)
        .get(`/api/tasks/${validTaskId}/files/${validFileId}/download`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('You do not have permission to download this file');
    });
  });

  describe('DELETE /api/tasks/:id/files/:fileId (Delete File)', () => {
    it('should allow task owner to delete a file (204 No Content)', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findUnique as jest.Mock).mockResolvedValue(sampleFileDbRecord as never);
      (prisma.file.delete as jest.Mock).mockResolvedValue(sampleFileDbRecord as never);
      (mockStorage.deleteFile as jest.Mock).mockResolvedValue(undefined as never);

      const res = await request(app)
        .delete(`/api/tasks/${validTaskId}/files/${validFileId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(204);
      expect(prisma.file.delete).toHaveBeenCalledWith({ where: { id: validFileId } });
      expect(mockStorage.deleteFile).toHaveBeenCalledWith(sampleFileDbRecord.storageKey);
    });

    it('should allow ADMIN to delete any file (204 No Content)', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findUnique as jest.Mock).mockResolvedValue(sampleFileDbRecord as never);
      (prisma.file.delete as jest.Mock).mockResolvedValue(sampleFileDbRecord as never);
      (mockStorage.deleteFile as jest.Mock).mockResolvedValue(undefined as never);

      const res = await request(app)
        .delete(`/api/tasks/${validTaskId}/files/${validFileId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
      expect(prisma.file.delete).toHaveBeenCalledWith({ where: { id: validFileId } });
    });

    it('should forbid user B from deleting user A file (403 Forbidden)', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findUnique as jest.Mock).mockResolvedValue(sampleFileDbRecord as never);

      const res = await request(app)
        .delete(`/api/tasks/${validTaskId}/files/${validFileId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('You do not have permission to delete this file');
      expect(prisma.file.delete).not.toHaveBeenCalled();
    });

    it('should return 404 when file to delete is not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findUnique as jest.Mock).mockResolvedValue(null as never);

      const res = await request(app)
        .delete(`/api/tasks/${validTaskId}/files/${validFileId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('File not found');
    });
  });
});
