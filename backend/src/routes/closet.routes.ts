import { Router } from 'express';
import * as closetController from '@/controllers/closet.controller';
import { authenticate } from '@/middlewares/authenticate';
import { validateBody, validateQuery } from '@/middlewares/validate';
import { uploadClothingImageMiddleware } from '@/middlewares/upload';
import { closetFiltersSchema } from '@/validators/closet.validator';
import { createClothingItemSchema, updateClothingItemSchema } from '@/validators/clothingItem.validator';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(closetFiltersSchema), closetController.listMyClothingItems);
router.post('/images', uploadClothingImageMiddleware, closetController.uploadClothingItemImage);
router.post('/', validateBody(createClothingItemSchema), closetController.createClothingItem);
router.get('/:id', closetController.getMyClothingItemDetail);
router.patch('/:id', validateBody(updateClothingItemSchema), closetController.updateMyClothingItem);
router.delete('/:id', closetController.deleteMyClothingItem);
router.patch('/:id/archive', closetController.archiveMyClothingItem);
router.patch('/:id/restore', closetController.restoreMyClothingItem);
router.patch('/:id/favorite', closetController.favoriteMyClothingItem);
router.patch('/:id/unfavorite', closetController.unfavoriteMyClothingItem);

export default router;
