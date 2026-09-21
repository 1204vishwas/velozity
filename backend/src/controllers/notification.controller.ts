import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { socketService } from '../services/socket.service';

export class NotificationController {
  public static async getNotifications(req: Request, res: Response): Promise<void> {
    const user = req.user!;

    const notifications = await prisma.notification.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        task: {
          select: { id: true, taskNumber: true, title: true, projectId: true },
        },
      },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.userId, isRead: false },
    });

    sendSuccess(res, { notifications, unreadCount });
  }

  public static async getUnreadCount(req: Request, res: Response): Promise<void> {
    const user = req.user!;

    const count = await prisma.notification.count({
      where: { userId: user.userId, isRead: false },
    });

    sendSuccess(res, { count });
  }

  public static async markAsRead(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: user.userId },
    });

    if (!notification) {
      sendError(res, 'Notification not found', 404, 'NOT_FOUND');
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.userId, isRead: false },
    });

    socketService.emitUnreadCount(user.userId, unreadCount);

    sendSuccess(res, updated, 'Notification marked as read');
  }

  public static async markAllAsRead(req: Request, res: Response): Promise<void> {
    const user = req.user!;

    await prisma.notification.updateMany({
      where: { userId: user.userId, isRead: false },
      data: { isRead: true },
    });

    socketService.emitUnreadCount(user.userId, 0);

    sendSuccess(res, null, 'All notifications marked as read');
  }
}
