import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod uses .issues (or .errors in older versions), error.issues[0]?.message gets the clean string!
        const errorMessage = error.issues[0]?.message || 'Validation error';
        return res.status(400).json({ message: errorMessage });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};