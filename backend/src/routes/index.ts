import { Router } from 'express';
import healthRoutes from '@/routes/health.routes';
import authRoutes from '@/routes/auth.routes';
import dollRoutes from '@/routes/doll.routes';
import catalogRoutes from '@/routes/catalog.routes';
import closetRoutes from '@/routes/closet.routes';
import outfitRoutes from '@/routes/outfit.routes';
import inspireMeRoutes from '@/routes/inspireMe.routes';
import adminRoutes from '@/routes/admin.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/doll', dollRoutes);
router.use('/catalog', catalogRoutes);
router.use('/closet', closetRoutes);
router.use('/outfits', outfitRoutes);
router.use('/inspire-me', inspireMeRoutes);
router.use('/admin', adminRoutes);

export default router;
