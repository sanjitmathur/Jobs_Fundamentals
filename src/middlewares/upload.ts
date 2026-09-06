import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { getMaxFileSize } from '../utils/fileValidation';
import { AppError } from '../utils/AppError';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: getMaxFileSize(),
    files: 10,
  },
});

export const singleUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new AppError(`File size exceeds maximum allowed limit of ${getMaxFileSize() / (1024 * 1024)}MB`, 400)
          );
        }
        return next(new AppError(`File upload error: ${err.message}`, 400));
      }
      return next(err);
    }
    next();
  });
};

export const multipleUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.array('files', 10)(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new AppError(`File size exceeds maximum allowed limit of ${getMaxFileSize() / (1024 * 1024)}MB`, 400)
          );
        }
        return next(new AppError(`File upload error: ${err.message}`, 400));
      }
      return next(err);
    }
    next();
  });
};
