import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole, checkTaskAccess } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createTaskSchema,
  updateTaskDetailsSchema,
  updateTaskStatusSchema,
  taskQueryFilterSchema,
} from '../validators/task.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', validate(taskQueryFilterSchema), TaskController.getTasks);
router.get('/:id', checkTaskAccess('read'), TaskController.getTaskById);
router.post(
  '/',
  requireRole(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(createTaskSchema),
  TaskController.createTask
);
router.put(
  '/:id',
  checkTaskAccess('update_details'),
  validate(updateTaskDetailsSchema),
  TaskController.updateTaskDetails
);
router.patch(
  '/:id/status',
  checkTaskAccess('update_status'),
  validate(updateTaskStatusSchema),
  TaskController.updateTaskStatus
);
router.delete(
  '/:id',
  checkTaskAccess('delete'),
  TaskController.deleteTask
);

export default router;
