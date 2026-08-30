import { Request, Response } from 'express';
import * as inspireMeService from '@/services/inspireMe.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError } from '@/utils/AppError';
import { GenerateRecommendationsInput } from '@/validators/inspireMe.validator';

function requireUserId(req: Request): string {
  if (!req.user) {
    throw new UnauthorizedError('Authentication is required.');
  }
  return req.user.id;
}

export const generateRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const result = await inspireMeService.generateRecommendations(
    requireUserId(req),
    req.body as GenerateRecommendationsInput,
  );
  res.status(200).json(result);
});
