import { Request, Response } from 'express';
import { z } from 'zod';
import * as adminService from '@/services/admin.service';
import { assertKnownCatalogType } from '@/services/admin.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError, ValidationError } from '@/utils/AppError';
import {
  CatalogType,
  CreateCategoryInput,
  CreateColorInput,
  CreateDollItemInput,
  CreateMaterialInput,
  CreateOccasionInput,
  CreatePatternInput,
  CreateStyleInput,
  CreateSubcategoryInput,
  UpdateDollItemInput,
} from '@/validators/admin.validator';

const uuidParam = z.string().uuid();

function requireUserId(req: Request): string {
  if (!req.user) {
    throw new UnauthorizedError('Authentication is required.');
  }
  return req.user.id;
}

function requireIdParam(req: Request, paramName = 'id'): string {
  const result = uuidParam.safeParse(req.params[paramName]);
  if (!result.success) {
    throw new ValidationError('A valid id is required.');
  }
  return result.data;
}

function requireCatalogType(req: Request): CatalogType {
  const type = typeof req.params.type === 'string' ? req.params.type : '';
  assertKnownCatalogType(type);
  return type;
}

// --- Users ---

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await adminService.listUsers();
  res.status(200).json({ users });
});

export const activateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.activateUser(requireIdParam(req));
  res.status(200).json({ user });
});

export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.deactivateUser(requireUserId(req), requireIdParam(req));
  res.status(200).json({ user });
});

// --- Catalog ---

export const listCatalog = asyncHandler(async (_req: Request, res: Response) => {
  const catalog = await adminService.listFullCatalog();
  res.status(200).json(catalog);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as CreateCategoryInput;
  const category = await adminService.createCategory(name);
  res.status(201).json({ category });
});

export const createMaterial = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as CreateMaterialInput;
  const material = await adminService.createMaterial(name);
  res.status(201).json({ material });
});

export const createPattern = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as CreatePatternInput;
  const pattern = await adminService.createPattern(name);
  res.status(201).json({ pattern });
});

export const createStyle = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as CreateStyleInput;
  const style = await adminService.createStyle(name);
  res.status(201).json({ style });
});

export const createSubcategory = asyncHandler(async (req: Request, res: Response) => {
  const subcategory = await adminService.createSubcategory(req.body as CreateSubcategoryInput);
  res.status(201).json({ subcategory });
});

export const createColor = asyncHandler(async (req: Request, res: Response) => {
  const color = await adminService.createColor(req.body as CreateColorInput);
  res.status(201).json({ color });
});

export const createOccasion = asyncHandler(async (req: Request, res: Response) => {
  const occasion = await adminService.createOccasion(req.body as CreateOccasionInput);
  res.status(201).json({ occasion });
});

export const activateCatalogEntry = asyncHandler(async (req: Request, res: Response) => {
  const type = requireCatalogType(req);
  const id = requireIdParam(req);
  await adminService.setCatalogEntryActive(type, id, true);
  res.status(204).send();
});

export const deactivateCatalogEntry = asyncHandler(async (req: Request, res: Response) => {
  const type = requireCatalogType(req);
  const id = requireIdParam(req);
  await adminService.setCatalogEntryActive(type, id, false);
  res.status(204).send();
});

// --- Doll Items ---

export const listDollItems = asyncHandler(async (_req: Request, res: Response) => {
  const dollItems = await adminService.listDollItems();
  res.status(200).json({ dollItems });
});

export const createDollItem = asyncHandler(async (req: Request, res: Response) => {
  const dollItem = await adminService.createDollItem(req.body as CreateDollItemInput);
  res.status(201).json({ dollItem });
});

export const updateDollItem = asyncHandler(async (req: Request, res: Response) => {
  const dollItem = await adminService.updateDollItem(requireIdParam(req), req.body as UpdateDollItemInput);
  res.status(200).json({ dollItem });
});

export const activateDollItem = asyncHandler(async (req: Request, res: Response) => {
  await adminService.setDollItemActive(requireIdParam(req), true);
  res.status(204).send();
});

export const deactivateDollItem = asyncHandler(async (req: Request, res: Response) => {
  await adminService.setDollItemActive(requireIdParam(req), false);
  res.status(204).send();
});
