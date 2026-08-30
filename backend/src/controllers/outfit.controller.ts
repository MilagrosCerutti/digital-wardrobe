import { Request, Response } from 'express';
import { z } from 'zod';
import * as outfitService from '@/services/outfit.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError, ValidationError } from '@/utils/AppError';
import { CreateOutfitInput, PreviewOutfitInput } from '@/validators/outfit.validator';

const uuidParam = z.string().uuid();

function requireUserId(req: Request): string {
  if (!req.user) {
    throw new UnauthorizedError('Authentication is required.');
  }
  return req.user.id;
}

function requireOutfitId(req: Request): string {
  const result = uuidParam.safeParse(req.params.id);
  if (!result.success) {
    throw new ValidationError('A valid look id is required.');
  }
  return result.data;
}

export const previewOutfit = asyncHandler(async (req: Request, res: Response) => {
  const { clothingItemIds } = req.body as PreviewOutfitInput;
  const result = await outfitService.previewOutfit(requireUserId(req), clothingItemIds);
  res.status(200).json(result);
});

export const createOutfit = asyncHandler(async (req: Request, res: Response) => {
  const outfit = await outfitService.createOutfit(requireUserId(req), req.body as CreateOutfitInput);
  res.status(201).json({ outfit });
});

export const listMyOutfits = asyncHandler(async (req: Request, res: Response) => {
  const outfits = await outfitService.listMyOutfits(requireUserId(req));
  res.status(200).json({ outfits });
});

export const getMyOutfitDetail = asyncHandler(async (req: Request, res: Response) => {
  const outfit = await outfitService.getMyOutfitDetail(requireUserId(req), requireOutfitId(req));
  res.status(200).json({ outfit });
});

export const deleteMyOutfit = asyncHandler(async (req: Request, res: Response) => {
  await outfitService.deleteMyOutfit(requireUserId(req), requireOutfitId(req));
  res.status(204).send();
});
