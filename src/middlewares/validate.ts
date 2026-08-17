import { z, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: z.ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
      }
      next(error);
    }
  };
