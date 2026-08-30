import { Router } from 'express';
import * as catalogController from '@/controllers/catalog.controller';
import { authenticate } from '@/middlewares/authenticate';

const router = Router();

router.get('/', authenticate, catalogController.getCatalog);

export default router;
