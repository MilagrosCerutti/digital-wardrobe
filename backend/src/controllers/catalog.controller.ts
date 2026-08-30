import { Request, Response } from 'express';
import * as catalogService from '@/services/catalog.service';
import { asyncHandler } from '@/utils/asyncHandler';

export const getCatalog = asyncHandler(async (_req: Request, res: Response) => {
  const catalog = await catalogService.getFullCatalog();
  res.status(200).json(catalog);
});
