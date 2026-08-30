import { Router } from 'express';
import * as inspireMeController from '@/controllers/inspireMe.controller';
import { authenticate } from '@/middlewares/authenticate';
import { validateBody } from '@/middlewares/validate';
import { generateRecommendationsSchema } from '@/validators/inspireMe.validator';

const router = Router();

router.use(authenticate);

router.post('/generate', validateBody(generateRecommendationsSchema), inspireMeController.generateRecommendations);

export default router;
