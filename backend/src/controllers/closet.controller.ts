import { Request, Response } from 'express';
import { z } from 'zod';
import * as closetService from '@/services/closet.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError, ValidationError } from '@/utils/AppError';
import { ClosetFiltersQuery } from '@/validators/closet.validator';
import { CreateClothingItemInput, UpdateClothingItemInput } from '@/validators/clothingItem.validator';

const uuidParam = z.string().uuid();

function requireUserId(req: Request): string {
  if (!req.user) {
    throw new UnauthorizedError('Authentication is required.');
  }
  return req.user.id;
}

function requireItemId(req: Request): string {
  const result = uuidParam.safeParse(req.params.id);
  if (!result.success) {
    throw new ValidationError('A valid clothing item id is required.');
  }
  return result.data;
}

export const listMyClothingItems = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.validatedQuery as ClosetFiltersQuery;
  const items = await closetService.listMyClothingItems(requireUserId(req), filters);
  res.status(200).json({ items });
});

export const uploadClothingItemImage = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const file = req.file as Express.Multer.File;
  const imageUrl = await closetService.uploadClothingItemImage(userId, {
    buffer: file.buffer,
    mimetype: file.mimetype,
  });
  res.status(201).json({ imageUrl });
});

export const createClothingItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const item = await closetService.createClothingItem(userId, req.body as CreateClothingItemInput);
  res.status(201).json({ item });
});

export const getMyClothingItemDetail = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const item = await closetService.getMyClothingItemDetail(userId, requireItemId(req));
  res.status(200).json({ item });
});

export const updateMyClothingItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const item = await closetService.updateMyClothingItem(
    userId,
    requireItemId(req),
    req.body as UpdateClothingItemInput,
  );
  res.status(200).json({ item });
});

export const deleteMyClothingItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  await closetService.deleteMyClothingItem(userId, requireItemId(req));
  res.status(204).send();
});

export const archiveMyClothingItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const item = await closetService.archiveMyClothingItem(userId, requireItemId(req));
  res.status(200).json({ item });
});

export const restoreMyClothingItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const item = await closetService.restoreMyClothingItem(userId, requireItemId(req));
  res.status(200).json({ item });
});

export const favoriteMyClothingItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const item = await closetService.favoriteMyClothingItem(userId, requireItemId(req));
  res.status(200).json({ item });
});

export const unfavoriteMyClothingItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const item = await closetService.unfavoriteMyClothingItem(userId, requireItemId(req));
  res.status(200).json({ item });
});
