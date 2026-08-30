import { Request, Response } from 'express';
import * as authService from '@/services/auth.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError } from '@/utils/AppError';
import { ChangePasswordInput, LoginInput, RegisterInput, UpdateProfileInput } from '@/validators/auth.validator';

function requireUserId(req: Request): string {
  if (!req.user) {
    throw new UnauthorizedError('Authentication is required.');
  }
  return req.user.id;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body as RegisterInput);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body as LoginInput);
  res.status(200).json(result);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(requireUserId(req));
  res.status(200).json({ user });
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateMyProfile(requireUserId(req), req.body as UpdateProfileInput);
  res.status(200).json({ user });
});

export const changeMyPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.changeMyPassword(requireUserId(req), req.body as ChangePasswordInput);
  res.status(204).send();
});
