import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { sendError } from '../utils/response';

/**
 * Enforce role-based access control (RBAC) at the route level.
 */
export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Requires one of roles: ${roles.join(', ')}`,
        403,
        'FORBIDDEN'
      );
      return;
    }

    next();
  };
};

/**
 * Enforce project-level ownership and access permissions:
 * - Admin: Full read/write access to all projects.
 * - Project Manager: Read/write ONLY on projects they created/manage.
 * - Developer: Read-only IF assigned to at least one task in that project; NO write access.
 */
export const checkProjectAccess = (action: 'read' | 'write' | 'delete' = 'read') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
        return;
      }

      const projectId = req.params.projectId || req.params.id;
      if (!projectId) {
        sendError(res, 'Project ID parameter is required', 400, 'BAD_REQUEST');
        return;
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          tasks: {
            select: { assignedToId: true },
          },
        },
      });

      if (!project) {
        sendError(res, 'Project not found', 404, 'NOT_FOUND');
        return;
      }

      // Admin has unrestricted access
      if (user.role === Role.ADMIN) {
        (req as any).project = project;
        return next();
      }

      // Project Manager: restricted strictly to projects they manage
      if (user.role === Role.PROJECT_MANAGER) {
        if (project.managerId !== user.userId) {
          sendError(
            res,
            'Forbidden: You do not have permission to access another Project Manager’s project',
            403,
            'FORBIDDEN'
          );
          return;
        }
        (req as any).project = project;
        return next();
      }

      // Developer: can only read projects they have assigned tasks in; no write or delete access
      if (user.role === Role.DEVELOPER) {
        if (action !== 'read') {
          sendError(
            res,
            'Forbidden: Developers do not have permission to modify or delete projects',
            403,
            'FORBIDDEN'
          );
          return;
        }

        const isAssigned = project.tasks.some((t) => t.assignedToId === user.userId);
        if (!isAssigned) {
          sendError(
            res,
            'Forbidden: Developers can only view projects with tasks assigned to them',
            403,
            'FORBIDDEN'
          );
          return;
        }

        (req as any).project = project;
        return next();
      }

      sendError(res, 'Forbidden', 403, 'FORBIDDEN');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Enforce task-level ownership and access permissions:
 * - Admin: Full access to all tasks.
 * - Project Manager: Can access/manage tasks only if project.managerId == user.id.
 * - Developer: Can ONLY access tasks assigned to them (assignedToId == user.id). Cannot view or edit other developers' tasks!
 */
export const checkTaskAccess = (action: 'read' | 'update_details' | 'update_status' | 'delete' = 'read') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
        return;
      }

      const taskId = req.params.taskId || req.params.id;
      if (!taskId) {
        sendError(res, 'Task ID parameter is required', 400, 'BAD_REQUEST');
        return;
      }

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: {
            select: { id: true, managerId: true },
          },
        },
      });

      if (!task) {
        sendError(res, 'Task not found', 404, 'NOT_FOUND');
        return;
      }

      // Admin has full access
      if (user.role === Role.ADMIN) {
        (req as any).task = task;
        return next();
      }

      // Project Manager: can access only tasks in projects they manage
      if (user.role === Role.PROJECT_MANAGER) {
        if (task.project.managerId !== user.userId) {
          sendError(
            res,
            'Forbidden: You cannot access or modify tasks outside of your managed projects',
            403,
            'FORBIDDEN'
          );
          return;
        }
        (req as any).task = task;
        return next();
      }

      // Developer: can ONLY access tasks assigned to them
      if (user.role === Role.DEVELOPER) {
        if (task.assignedToId !== user.userId) {
          sendError(
            res,
            'Forbidden: You are not authorized to view or modify other developers’ tasks',
            403,
            'FORBIDDEN'
          );
          return;
        }

        if (action === 'update_details' || action === 'delete') {
          sendError(
            res,
            'Forbidden: Developers are only permitted to update task status, not task details or deletion',
            403,
            'FORBIDDEN'
          );
          return;
        }

        (req as any).task = task;
        return next();
      }

      sendError(res, 'Forbidden', 403, 'FORBIDDEN');
    } catch (error) {
      next(error);
    }
  };
};
