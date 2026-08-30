import { Router } from 'express';
import * as dollController from '@/controllers/doll.controller';
import { authenticate } from '@/middlewares/authenticate';
import { validateBody } from '@/middlewares/validate';
import { equipDollItemSchema, updateDollAppearanceSchema } from '@/validators/doll.validator';

const router = Router();

router.use(authenticate);

router.get('/items', dollController.listDollItems);
router.get('/', dollController.getMyDoll);
router.patch('/', validateBody(updateDollAppearanceSchema), dollController.updateMyDollAppearance);
router.post('/equipment', validateBody(equipDollItemSchema), dollController.equipDollItem);
router.delete('/equipment/:dollItemId', dollController.unequipDollItem);

export default router;
