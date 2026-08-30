import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '@/utils/AppError';
import { UserRole } from '@/types/user.types';

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication is required.'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('You do not have permission to perform this action.'));
      return;
    }

    next();
  };
}
