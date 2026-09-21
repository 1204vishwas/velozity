import { prisma } from '../config/prisma';
import { socketService } from './socket.service';
import { TaskStatus, ActivityAction, NotificationType } from '@prisma/client';

export const formatStatusName = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return 'To Do';
    case TaskStatus.IN_PROGRESS:
      return 'In Progress';
    case TaskStatus.IN_REVIEW:
      return 'In Review';
    case TaskStatus.DONE:
      return 'Done';
    default:
      return status;
  }
};

export class ActivityService {
  /**
   * Log a task status change in the database and trigger real-time WebSocket events.
   */
  public static async logStatusChange(params: {
    taskId: string;
    userId: string;
    userName: string;
    fromStatus: TaskStatus;
    toStatus: TaskStatus;
  }) {
    const { taskId, userId, userName, fromStatus, toStatus } = params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, name: true, managerId: true },
        },
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    });

    if (!task) return null;

    const formattedFrom = formatStatusName(fromStatus);
    const formattedTo = formatStatusName(toStatus);
    const message = `${userName} moved Task #${task.taskNumber} from ${formattedFrom} → ${formattedTo}`;

    // Store activity in database (persisted, not derived)
    const log = await prisma.activityLog.create({
      data: {
        taskId: task.id,
        projectId: task.projectId,
        userId: userId,
        action: ActivityAction.STATUS_CHANGE,
        fromStatus,
        toStatus,
        message,
        details: JSON.stringify({
          taskTitle: task.title,
          projectName: task.project.name,
        }),
      },
    });

    // Real-time broadcast with role-filtered distribution
    socketService.broadcastActivity({
      id: log.id,
      taskId: task.id,
      taskNumber: task.taskNumber,
      projectId: task.projectId,
      projectManagerId: task.project.managerId,
      assignedToId: task.assignedToId,
      userId,
      userName,
      action: ActivityAction.STATUS_CHANGE,
      message,
      fromStatus,
      toStatus,
      createdAt: log.createdAt,
    });

    // Check if task moved to IN_REVIEW: notify Project Manager
    if (toStatus === TaskStatus.IN_REVIEW && task.project.managerId) {
      await ActivityService.createNotification({
        userId: task.project.managerId,
        taskId: task.id,
        type: NotificationType.TASK_IN_REVIEW,
        title: 'Task Ready for Review',
        message: `Task #${task.taskNumber} "${task.title}" was moved to In Review by ${userName}`,
      });
    }

    return log;
  }

  /**
   * Create an in-app notification in DB and emit in real-time.
   */
  public static async createNotification(params: {
    userId: string;
    taskId?: string;
    type: NotificationType;
    title: string;
    message: string;
  }) {
    const { userId, taskId, type, title, message } = params;

    const notification = await prisma.notification.create({
      data: {
        userId,
        taskId,
        type,
        title,
        message,
      },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    socketService.emitNotification(userId, notification);
    socketService.emitUnreadCount(userId, unreadCount);

    return notification;
  }

  /**
   * Notify developer of task assignment.
   */
  public static async notifyTaskAssigned(taskId: string, developerId: string, assignedByName: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { taskNumber: true, title: true, projectId: true },
    });

    if (!task) return;

    await ActivityService.createNotification({
      userId: developerId,
      taskId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: `${assignedByName} assigned you Task #${task.taskNumber}: "${task.title}"`,
    });
  }
}
