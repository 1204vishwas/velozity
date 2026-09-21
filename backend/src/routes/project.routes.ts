import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole, checkProjectAccess } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', ProjectController.getProjects);
router.get('/:id', checkProjectAccess('read'), ProjectController.getProjectById);
router.post(
  '/',
  requireRole(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(createProjectSchema),
  ProjectController.createProject
);
router.put(
  '/:id',
  checkProjectAccess('write'),
  validate(updateProjectSchema),
  ProjectController.updateProject
);
router.delete(
  '/:id',
  requireRole(Role.ADMIN),
  checkProjectAccess('delete'),
  ProjectController.deleteProject
);

export default router;
