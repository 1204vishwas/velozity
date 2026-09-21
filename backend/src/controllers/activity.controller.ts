import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { Role } from '@prisma/client';

export class ActivityController {
  public static async getActivities(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 50);

    let whereClause: any = {};

    if (user.role === Role.ADMIN) {
      // Admin sees global activity across all projects
      whereClause = {};
    } else if (user.role === Role.PROJECT_MANAGER) {
      // PM sees activity only from their own projects
      whereClause = {
        project: {
          managerId: user.userId,
        },
      };
    } else if (user.role === Role.DEVELOPER) {
      // Developer sees activity only on tasks assigned to them
      whereClause = {
        task: {
          assignedToId: user.userId,
        },
      };
    }

    const activities = await prisma.activityLog.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, role: true },
        },
        task: {
          select: { id: true, taskNumber: true, title: true, status: true, priority: true },
        },
        project: {
          select: { id: true, name: true, managerId: true },
        },
      },
    });

    sendSuccess(res, activities);
  }
}
