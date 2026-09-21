import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import activityRoutes from './activity.routes';
import notificationRoutes from './notification.routes';
import clientRoutes from './client.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/activity', activityRoutes);
router.use('/notifications', notificationRoutes);
router.use('/clients', clientRoutes);
router.use('/analytics', analyticsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
