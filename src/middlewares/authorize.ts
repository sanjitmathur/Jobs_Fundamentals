import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export const authorize =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'insufficient permissions' });
      return;
    }

    next();
  };
