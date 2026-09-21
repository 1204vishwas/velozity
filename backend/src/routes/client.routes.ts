import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createClientSchema, updateClientSchema } from '../validators/client.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', ClientController.getClients);
router.post(
  '/',
  requireRole(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(createClientSchema),
  ClientController.createClient
);
router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(updateClientSchema),
  ClientController.updateClient
);
router.delete('/:id', requireRole(Role.ADMIN), ClientController.deleteClient);

export default router;
