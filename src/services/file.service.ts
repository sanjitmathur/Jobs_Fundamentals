import crypto from 'crypto';
import path from 'path';
import { Role } from '@prisma/client';
import { prisma } from '../utils/db';
import { AppError } from '../utils/AppError';
import { getStorageProvider } from '../storage';
import { validateUploadedFile } from '../utils/fileValidation';

export async function uploadFile(
  taskId: string,
  file: Express.Multer.File | undefined,
  requesterId: string,
  requesterRole: Role
) {
  if (!file) {
    throw new AppError('File is required', 400);
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (requesterRole !== Role.ADMIN && task.userId !== requesterId) {
    throw new AppError('You do not have permission to upload files for this task', 403);
  }

  const { validatedMimeType, sanitizedOriginalName } = validateUploadedFile(file);

  const ext = path.extname(sanitizedOriginalName).toLowerCase();
  const storageKey = `${crypto.randomUUID()}${ext}`;

  const storageProvider = getStorageProvider();

  await storageProvider.saveFile(storageKey, file.buffer, validatedMimeType);

  try {
    const fileRecord = await prisma.file.create({
      data: {
        originalName: sanitizedOriginalName,
        storageKey,
        mimeType: validatedMimeType,
        size: file.size,
        taskId,
        uploadedById: requesterId,
      },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        size: true,
        createdAt: true,
        updatedAt: true,
        taskId: true,
        uploadedById: true,
      },
    });

    return fileRecord;
  } catch (dbError) {
    try {
      await storageProvider.deleteFile(storageKey);
    } catch (cleanupErr) {
      console.error('Failed to clean up storage file after DB failure:', cleanupErr);
    }
    throw dbError;
  }
}

export async function uploadMultipleFiles(
  taskId: string,
  files: Express.Multer.File[] | undefined,
  requesterId: string,
  requesterRole: Role
) {
  if (!files || files.length === 0) {
    throw new AppError('At least one file is required', 400);
  }

  const results = [];
  for (const file of files) {
    const uploaded = await uploadFile(taskId, file, requesterId, requesterRole);
    results.push(uploaded);
  }
  return results;
}

export async function getFilesByTaskId(
  taskId: string,
  requesterId: string,
  requesterRole: Role
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (requesterRole !== Role.ADMIN && task.userId !== requesterId) {
    throw new AppError('You do not have permission to view files for this task', 403);
  }

  return prisma.file.findMany({
    where: { taskId },
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      size: true,
      createdAt: true,
      updatedAt: true,
      taskId: true,
      uploadedById: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFileById(
  taskId: string,
  fileId: string,
  requesterId: string,
  requesterRole: Role
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (requesterRole !== Role.ADMIN && task.userId !== requesterId) {
    throw new AppError('You do not have permission to view this file', 403);
  }

  const file = await prisma.file.findUnique({
    where: { id: fileId },
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      size: true,
      createdAt: true,
      updatedAt: true,
      taskId: true,
      uploadedById: true,
    },
  });

  if (!file || file.taskId !== taskId) {
    throw new AppError('File not found', 404);
  }

  return file;
}

export async function getFileForDownload(
  taskId: string,
  fileId: string,
  requesterId: string,
  requesterRole: Role
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (requesterRole !== Role.ADMIN && task.userId !== requesterId) {
    throw new AppError('You do not have permission to download this file', 403);
  }

  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (!file || file.taskId !== taskId) {
    throw new AppError('File not found', 404);
  }

  const storageProvider = getStorageProvider();
  const stream = await storageProvider.getFileStream(file.storageKey);

  return {
    file: {
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
    },
    stream,
  };
}

export async function deleteFile(
  taskId: string,
  fileId: string,
  requesterId: string,
  requesterRole: Role
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (requesterRole !== Role.ADMIN && task.userId !== requesterId) {
    throw new AppError('You do not have permission to delete this file', 403);
  }

  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (!file || file.taskId !== taskId) {
    throw new AppError('File not found', 404);
  }

  await prisma.file.delete({ where: { id: fileId } });

  const storageProvider = getStorageProvider();
  try {
    await storageProvider.deleteFile(file.storageKey);
  } catch (storageErr) {
    console.error(`Failed to delete physical file ${file.storageKey} from storage:`, storageErr);
  }
}
