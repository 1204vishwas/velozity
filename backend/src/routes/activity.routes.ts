import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Fetches the last 20 activities (missed event catchup, strictly role-filtered)
router.get('/', ActivityController.getActivities);

export default router;
