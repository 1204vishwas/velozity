import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { Role, TaskStatus, TaskPriority } from '@prisma/client';
import { socketService } from '../services/socket.service';

export class AnalyticsController {
  public static async getDashboardStats(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (user.role === Role.ADMIN) {
      // Admin dashboard metrics
      const [
        totalProjects,
        totalTasks,
        tasksByStatusRaw,
        overdueTaskCount,
        totalClients,
        totalUsers,
      ] = await Promise.all([
        prisma.project.count(),
        prisma.task.count(),
        prisma.task.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        prisma.task.count({
          where: {
            OR: [
              { isOverdue: true },
              { dueDate: { lt: now }, status: { not: TaskStatus.DONE } },
            ],
          },
        }),
        prisma.client.count(),
        prisma.user.count(),
      ]);

      const tasksByStatus = {
        [TaskStatus.TODO]: 0,
        [TaskStatus.IN_PROGRESS]: 0,
        [TaskStatus.IN_REVIEW]: 0,
        [TaskStatus.DONE]: 0,
      };
      tasksByStatusRaw.forEach((item) => {
        tasksByStatus[item.status] = item._count._all;
      });

      sendSuccess(res, {
        role: Role.ADMIN,
        totalProjects,
        totalTasks,
        tasksByStatus,
        overdueTaskCount,
        activeUsersOnline: socketService.getOnlineUserCount(),
        totalClients,
        totalUsers,
      });
      return;
    }

    if (user.role === Role.PROJECT_MANAGER) {
      // PM dashboard metrics
      const [
        managedProjects,
        tasksByStatusRaw,
        tasksByPriorityRaw,
        overdueTaskCount,
        upcomingTasks,
      ] = await Promise.all([
        prisma.project.findMany({
          where: { managerId: user.userId },
          select: { id: true, name: true, status: true, _count: { select: { tasks: true } } },
        }),
        prisma.task.groupBy({
          by: ['status'],
          where: { project: { managerId: user.userId } },
          _count: { _all: true },
        }),
        prisma.task.groupBy({
          by: ['priority'],
          where: { project: { managerId: user.userId } },
          _count: { _all: true },
        }),
        prisma.task.count({
          where: {
            project: { managerId: user.userId },
            OR: [
              { isOverdue: true },
              { dueDate: { lt: now }, status: { not: TaskStatus.DONE } },
            ],
          },
        }),
        prisma.task.findMany({
          where: {
            project: { managerId: user.userId },
            dueDate: { gte: now, lte: nextWeek },
            status: { not: TaskStatus.DONE },
          },
          select: {
            id: true,
            taskNumber: true,
            title: true,
            dueDate: true,
            priority: true,
            status: true,
            assignedTo: { select: { name: true } },
          },
          orderBy: { dueDate: 'asc' },
          take: 10,
        }),
      ]);

      const tasksByStatus = {
        [TaskStatus.TODO]: 0,
        [TaskStatus.IN_PROGRESS]: 0,
        [TaskStatus.IN_REVIEW]: 0,
        [TaskStatus.DONE]: 0,
      };
      tasksByStatusRaw.forEach((item) => {
        tasksByStatus[item.status] = item._count._all;
      });

      const tasksByPriority = {
        [TaskPriority.LOW]: 0,
        [TaskPriority.MEDIUM]: 0,
        [TaskPriority.HIGH]: 0,
        [TaskPriority.CRITICAL]: 0,
      };
      tasksByPriorityRaw.forEach((item) => {
        tasksByPriority[item.priority] = item._count._all;
      });

      sendSuccess(res, {
        role: Role.PROJECT_MANAGER,
        myProjectsCount: managedProjects.length,
        projects: managedProjects,
        tasksByStatus,
        tasksByPriority,
        overdueTaskCount,
        upcomingDueDatesThisWeek: upcomingTasks,
      });
      return;
    }

    if (user.role === Role.DEVELOPER) {
      // Developer dashboard metrics
      const [
        assignedTasksCount,
        tasksByStatusRaw,
        overdueTaskCount,
        upcomingTasks,
      ] = await Promise.all([
        prisma.task.count({
          where: { assignedToId: user.userId },
        }),
        prisma.task.groupBy({
          by: ['status'],
          where: { assignedToId: user.userId },
          _count: { _all: true },
        }),
        prisma.task.count({
          where: {
            assignedToId: user.userId,
            OR: [
              { isOverdue: true },
              { dueDate: { lt: now }, status: { not: TaskStatus.DONE } },
            ],
          },
        }),
        prisma.task.findMany({
          where: {
            assignedToId: user.userId,
            dueDate: { gte: now, lte: nextWeek },
            status: { not: TaskStatus.DONE },
          },
          select: {
            id: true,
            taskNumber: true,
            title: true,
            dueDate: true,
            priority: true,
            status: true,
            project: { select: { name: true } },
          },
          orderBy: { dueDate: 'asc' },
          take: 10,
        }),
      ]);

      const tasksByStatus = {
        [TaskStatus.TODO]: 0,
        [TaskStatus.IN_PROGRESS]: 0,
        [TaskStatus.IN_REVIEW]: 0,
        [TaskStatus.DONE]: 0,
      };
      tasksByStatusRaw.forEach((item) => {
        tasksByStatus[item.status] = item._count._all;
      });

      sendSuccess(res, {
        role: Role.DEVELOPER,
        assignedTasksCount,
        tasksByStatus,
        overdueTaskCount,
        upcomingDueDatesThisWeek: upcomingTasks,
      });
      return;
    }

    sendSuccess(res, {});
  }
}
