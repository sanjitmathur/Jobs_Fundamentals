import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (res.headersSent) {
    return _next(err);
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err.name === 'MulterError') {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error(err.stack);
  const errObj = err as unknown as Record<string, unknown>;
  const causeObj = errObj.cause as { message?: string } | undefined;
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message,
    cause: causeObj?.message,
    code: errObj.code,
    meta: errObj.meta,
  });
};

