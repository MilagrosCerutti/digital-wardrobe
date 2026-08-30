import { Router } from 'express';
import * as outfitController from '@/controllers/outfit.controller';
import { authenticate } from '@/middlewares/authenticate';
import { validateBody } from '@/middlewares/validate';
import { createOutfitSchema, previewOutfitSchema } from '@/validators/outfit.validator';

const router = Router();

router.use(authenticate);

router.post('/preview', validateBody(previewOutfitSchema), outfitController.previewOutfit);
router.get('/', outfitController.listMyOutfits);
router.post('/', validateBody(createOutfitSchema), outfitController.createOutfit);
router.get('/:id', outfitController.getMyOutfitDetail);
router.delete('/:id', outfitController.deleteMyOutfit);

export default router;
