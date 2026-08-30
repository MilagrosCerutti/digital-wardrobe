import { Request, Response } from 'express';
import * as dollService from '@/services/doll.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError, ValidationError } from '@/utils/AppError';
import { EquipDollItemInput, UpdateDollAppearanceInput } from '@/validators/doll.validator';

function requireUserId(req: Request): string {
  if (!req.user) {
    throw new UnauthorizedError('Authentication is required.');
  }
  return req.user.id;
}

export const listDollItems = asyncHandler(async (_req: Request, res: Response) => {
  const items = await dollService.listActiveDollItems();
  res.status(200).json({ items });
});

export const getMyDoll = asyncHandler(async (req: Request, res: Response) => {
  const profile = await dollService.getDollProfile(requireUserId(req));
  res.status(200).json(profile);
});

export const updateMyDollAppearance = asyncHandler(async (req: Request, res: Response) => {
  const doll = await dollService.updateAppearance(
    requireUserId(req),
    req.body as UpdateDollAppearanceInput,
  );
  res.status(200).json({ doll });
});

export const equipDollItem = asyncHandler(async (req: Request, res: Response) => {
  const { dollItemId } = req.body as EquipDollItemInput;
  const profile = await dollService.equipItem(requireUserId(req), dollItemId);
  res.status(200).json(profile);
});

export const unequipDollItem = asyncHandler(async (req: Request, res: Response) => {
  const { dollItemId } = req.params;
  if (typeof dollItemId !== 'string' || dollItemId.length === 0) {
    throw new ValidationError('A doll item id is required.');
  }

  const profile = await dollService.unequipItem(requireUserId(req), dollItemId);
  res.status(200).json(profile);
});
