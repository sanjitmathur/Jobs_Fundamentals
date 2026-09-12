import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Role } from '@prisma/client';
import {
  uploadFile,
  uploadMultipleFiles,
  getFilesByTaskId,
  getFileById,
  getFileForDownload,
  deleteFile,
} from '../services/file.service';
import { prisma } from '../utils/db';
import { getStorageProvider } from '../storage';
import { Readable } from 'stream';

jest.mock('../utils/db', () => ({
  prisma: {
    task: {
      findUnique: jest.fn(),
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

describe('FileService Unit Tests', () => {
  const sampleTask = {
    id: 'task-100',
    title: 'Sample Task',
    description: 'Sample description',
    userId: 'user-1',
  };

  const samplePdfBuffer = Buffer.from('%PDF-1.4 test content');
  const samplePdfFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'document.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: samplePdfBuffer.length,
    buffer: samplePdfBuffer,
    destination: '',
    filename: '',
    path: '',
    stream: Readable.from([]),
  };

  const mockStorage = getStorageProvider() as jest.Mocked<ReturnType<typeof getStorageProvider>>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should successfully upload a valid file to an owned task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (mockStorage.saveFile as jest.Mock).mockResolvedValue(undefined as never);
      (prisma.file.create as jest.Mock).mockResolvedValue({
        id: 'file-1',
        originalName: 'document.pdf',
        mimeType: 'application/pdf',
        size: samplePdfBuffer.length,
        createdAt: new Date(),
        updatedAt: new Date(),
        taskId: 'task-100',
        uploadedById: 'user-1',
      } as never);

      const result = await uploadFile('task-100', samplePdfFile, 'user-1', Role.USER);

      expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 'task-100' } });
      expect(mockStorage.saveFile).toHaveBeenCalled();
      expect(prisma.file.create).toHaveBeenCalled();
      expect(result.originalName).toBe('document.pdf');
    });

    it('should allow ADMIN to upload to any task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (mockStorage.saveFile as jest.Mock).mockResolvedValue(undefined as never);
      (prisma.file.create as jest.Mock).mockResolvedValue({
        id: 'file-2',
        originalName: 'document.pdf',
        mimeType: 'application/pdf',
        size: samplePdfBuffer.length,
        taskId: 'task-100',
        uploadedById: 'admin-id',
      } as never);

      const result = await uploadFile('task-100', samplePdfFile, 'admin-id', Role.ADMIN);

      expect(result.id).toBe('file-2');
    });

    it('should throw 404 when task is not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null as never);

      await expect(uploadFile('non-existent', samplePdfFile, 'user-1', Role.USER)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Task not found',
      });
    });

    it('should throw 403 when user does not own task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

      await expect(uploadFile('task-100', samplePdfFile, 'other-user', Role.USER)).rejects.toMatchObject({
        statusCode: 403,
        message: 'You do not have permission to upload files for this task',
      });
    });

    it('should throw 400 when file is missing', async () => {
      await expect(uploadFile('task-100', undefined, 'user-1', Role.USER)).rejects.toMatchObject({
        statusCode: 400,
        message: 'File is required',
      });
    });

    it('should throw 400 when file is empty (0 bytes)', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

      const emptyFile: Express.Multer.File = {
        ...samplePdfFile,
        size: 0,
        buffer: Buffer.alloc(0),
      };

      await expect(uploadFile('task-100', emptyFile, 'user-1', Role.USER)).rejects.toMatchObject({
        statusCode: 400,
        message: 'File cannot be empty',
      });
    });

    it('should throw 400 when file type has magic number mismatch', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

      const fakePdf: Express.Multer.File = {
        ...samplePdfFile,
        buffer: Buffer.from('NOT_A_PDF_HEADER'),
        size: 16,
      };

      await expect(uploadFile('task-100', fakePdf, 'user-1', Role.USER)).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it('should clean up physical file if DB create fails', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (mockStorage.saveFile as jest.Mock).mockResolvedValue(undefined as never);
      (prisma.file.create as jest.Mock).mockRejectedValue(new Error('DB Connection Failed') as never);
      (mockStorage.deleteFile as jest.Mock).mockResolvedValue(undefined as never);

      await expect(uploadFile('task-100', samplePdfFile, 'user-1', Role.USER)).rejects.toThrow(
        'DB Connection Failed'
      );
      expect(mockStorage.deleteFile).toHaveBeenCalled();
    });
  });

  describe('uploadMultipleFiles', () => {
    it('should upload multiple files', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (mockStorage.saveFile as jest.Mock).mockResolvedValue(undefined as never);
      (prisma.file.create as jest.Mock).mockResolvedValue({
        id: 'file-multi',
        originalName: 'document.pdf',
        mimeType: 'application/pdf',
        size: samplePdfBuffer.length,
        taskId: 'task-100',
        uploadedById: 'user-1',
      } as never);

      const results = await uploadMultipleFiles(
        'task-100',
        [samplePdfFile, samplePdfFile],
        'user-1',
        Role.USER
      );

      expect(results.length).toBe(2);
    });

    it('should throw 400 if files array is empty', async () => {
      await expect(uploadMultipleFiles('task-100', [], 'user-1', Role.USER)).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe('getFilesByTaskId', () => {
    it('should return files for task owner', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findMany as jest.Mock).mockResolvedValue([
        { id: 'f1', originalName: 'doc1.pdf' },
        { id: 'f2', originalName: 'doc2.pdf' },
      ] as never);

      const files = await getFilesByTaskId('task-100', 'user-1', Role.USER);
      expect(files.length).toBe(2);
    });

    it('should throw 403 if user is not owner or admin', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);

      await expect(getFilesByTaskId('task-100', 'stranger', Role.USER)).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });

  describe('getFileById', () => {
    it('should return file metadata', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findUnique as jest.Mock).mockResolvedValue({
        id: 'file-1',
        originalName: 'document.pdf',
        taskId: 'task-100',
      } as never);

      const file = await getFileById('task-100', 'file-1', 'user-1', Role.USER);
      expect(file.id).toBe('file-1');
    });

    it('should throw 404 if file does not belong to task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findUnique as jest.Mock).mockResolvedValue({
        id: 'file-1',
        originalName: 'document.pdf',
        taskId: 'different-task',
      } as never);

      await expect(getFileById('task-100', 'file-1', 'user-1', Role.USER)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('getFileForDownload', () => {
    it('should return file metadata and readable stream', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findUnique as jest.Mock).mockResolvedValue({
        id: 'file-1',
        originalName: 'document.pdf',
        mimeType: 'application/pdf',
        size: 100,
        storageKey: 'safe-key.pdf',
        taskId: 'task-100',
      } as never);

      const mockStream = new Readable({
        read() {
          this.push(null);
        },
      });
      (mockStorage.getFileStream as jest.Mock).mockResolvedValue(mockStream as never);

      const result = await getFileForDownload('task-100', 'file-1', 'user-1', Role.USER);

      expect(result.file.originalName).toBe('document.pdf');
      expect(result.stream).toBeDefined();
    });
  });

  describe('deleteFile', () => {
    it('should delete DB record and call storage delete', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findUnique as jest.Mock).mockResolvedValue({
        id: 'file-1',
        storageKey: 'safe-key.pdf',
        taskId: 'task-100',
      } as never);
      (prisma.file.delete as jest.Mock).mockResolvedValue({ id: 'file-1' } as never);
      (mockStorage.deleteFile as jest.Mock).mockResolvedValue(undefined as never);

      await expect(deleteFile('task-100', 'file-1', 'user-1', Role.USER)).resolves.toBeUndefined();

      expect(prisma.file.delete).toHaveBeenCalledWith({ where: { id: 'file-1' } });
      expect(mockStorage.deleteFile).toHaveBeenCalledWith('safe-key.pdf');
    });

    it('should succeed even if storage delete encounters error (resilient deletion)', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(sampleTask as never);
      (prisma.file.findUnique as jest.Mock).mockResolvedValue({
        id: 'file-1',
        storageKey: 'safe-key.pdf',
        taskId: 'task-100',
      } as never);
      (prisma.file.delete as jest.Mock).mockResolvedValue({ id: 'file-1' } as never);
      (mockStorage.deleteFile as jest.Mock).mockRejectedValue(new Error('Storage disk unmounted') as never);

      await expect(deleteFile('task-100', 'file-1', 'user-1', Role.USER)).resolves.toBeUndefined();
      expect(prisma.file.delete).toHaveBeenCalledWith({ where: { id: 'file-1' } });
    });
  });
});
