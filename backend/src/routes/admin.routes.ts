import { Router } from 'express';
import * as adminController from '@/controllers/admin.controller';
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import { validateBody } from '@/middlewares/validate';
import {
  createCategorySchema,
  createColorSchema,
  createDollItemSchema,
  createMaterialSchema,
  createOccasionSchema,
  createPatternSchema,
  createStyleSchema,
  createSubcategorySchema,
  updateDollItemSchema,
} from '@/validators/admin.validator';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/users', adminController.listUsers);
router.patch('/users/:id/activate', adminController.activateUser);
router.patch('/users/:id/deactivate', adminController.deactivateUser);

router.get('/catalog', adminController.listCatalog);
router.post('/catalog/categories', validateBody(createCategorySchema), adminController.createCategory);
router.post('/catalog/materials', validateBody(createMaterialSchema), adminController.createMaterial);
router.post('/catalog/patterns', validateBody(createPatternSchema), adminController.createPattern);
router.post('/catalog/styles', validateBody(createStyleSchema), adminController.createStyle);
router.post(
  '/catalog/subcategories',
  validateBody(createSubcategorySchema),
  adminController.createSubcategory,
);
router.post('/catalog/colors', validateBody(createColorSchema), adminController.createColor);
router.post('/catalog/occasions', validateBody(createOccasionSchema), adminController.createOccasion);
router.patch('/catalog/:type/:id/activate', adminController.activateCatalogEntry);
router.patch('/catalog/:type/:id/deactivate', adminController.deactivateCatalogEntry);

router.get('/doll-items', adminController.listDollItems);
router.post('/doll-items', validateBody(createDollItemSchema), adminController.createDollItem);
router.patch('/doll-items/:id', validateBody(updateDollItemSchema), adminController.updateDollItem);
router.patch('/doll-items/:id/activate', adminController.activateDollItem);
router.patch('/doll-items/:id/deactivate', adminController.deactivateDollItem);

export default router;
