import { Router } from 'express';
import * as authController from '@/controllers/auth.controller';
import { authenticate } from '@/middlewares/authenticate';
import { validateBody } from '@/middlewares/validate';
import { changePasswordSchema, loginSchema, registerSchema, updateProfileSchema } from '@/validators/auth.validator';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, validateBody(updateProfileSchema), authController.updateMyProfile);
router.patch(
  '/me/password',
  authenticate,
  validateBody(changePasswordSchema),
  authController.changeMyPassword,
);

export default router;
