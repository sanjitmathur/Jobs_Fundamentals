import { Request, Response, NextFunction } from 'express';
import * as FileService from '../services/file.service';

export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = (req.params.taskId || req.params.id) as string;
    const file = await FileService.uploadFile(
      taskId,
      req.file,
      req.user!.userId,
      req.user!.role
    );
    res.status(201).json(file);
  } catch (error) {
    next(error);
  }
};

export const uploadMultiple = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = (req.params.taskId || req.params.id) as string;
    const files = await FileService.uploadMultipleFiles(
      taskId,
      req.files as Express.Multer.File[],
      req.user!.userId,
      req.user!.role
    );
    res.status(201).json(files);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = (req.params.taskId || req.params.id) as string;
    const files = await FileService.getFilesByTaskId(
      taskId,
      req.user!.userId,
      req.user!.role
    );
    res.status(200).json(files);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = (req.params.taskId || req.params.id) as string;
    const fileId = req.params.fileId as string;
    const file = await FileService.getFileById(
      taskId,
      fileId,
      req.user!.userId,
      req.user!.role
    );
    res.status(200).json(file);
  } catch (error) {
    next(error);
  }
};

export const download = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = (req.params.taskId || req.params.id) as string;
    const fileId = req.params.fileId as string;
    const { file, stream } = await FileService.getFileForDownload(
      taskId,
      fileId,
      req.user!.userId,
      req.user!.role
    );

    const safeFilename = encodeURIComponent(file.originalName);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.size);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.originalName.replace(/["\r\n]/g, '_')}"; filename*=UTF-8''${safeFilename}`
    );

    stream.on('error', (streamErr) => {
      next(streamErr);
    });

    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = (req.params.taskId || req.params.id) as string;
    const fileId = req.params.fileId as string;
    await FileService.deleteFile(
      taskId,
      fileId,
      req.user!.userId,
      req.user!.role
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const FileController = {
  upload,
  uploadMultiple,
  list,
  getOne,
  download,
  remove,
};
