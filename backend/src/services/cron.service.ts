import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { TaskStatus, ActivityAction, NotificationType } from '@prisma/client';
import { socketService } from './socket.service';
import { ActivityService } from './activity.service';

export class CronService {
  private static task: cron.ScheduledTask | null = null;

  public static init() {
    // Run every minute: checks for tasks that passed due date
    this.task = cron.schedule('* * * * *', async () => {
      await CronService.checkOverdueTasks();
    });

    console.log('⏱️ Overdue task background scheduler initialized (runs every minute).');

    // Run an initial sweep immediately on startup
    CronService.checkOverdueTasks().catch((err) =>
      console.error('Error running initial overdue task sweep:', err)
    );
  }

  public static async checkOverdueTasks(): Promise<number> {
    try {
      const now = new Date();

      // Find tasks that are past due, not DONE, and not yet marked as overdue
      const overdueTasks = await prisma.task.findMany({
        where: {
          dueDate: { lt: now },
          status: { not: TaskStatus.DONE },
          isOverdue: false,
        },
        include: {
          project: {
            select: { id: true, name: true, managerId: true },
          },
          assignedTo: {
            select: { id: true, name: true },
          },
        },
      });

      if (overdueTasks.length === 0) {
        return 0;
      }

      console.log(`⏱️ Scheduler detected ${overdueTasks.length} newly overdue tasks.`);

      for (const task of overdueTasks) {
        // Mark as overdue
        await prisma.task.update({
          where: { id: task.id },
          data: { isOverdue: true },
        });

        const message = `System flagged Task #${task.taskNumber} "${task.title}" as Overdue`;

        // Record activity log
        const log = await prisma.activityLog.create({
          data: {
            taskId: task.id,
            projectId: task.projectId,
            action: ActivityAction.TASK_OVERDUE,
            message,
            details: JSON.stringify({
              taskTitle: task.title,
              dueDate: task.dueDate,
            }),
          },
        });

        // Broadcast activity
        socketService.broadcastActivity({
          id: log.id,
          taskId: task.id,
          taskNumber: task.taskNumber,
          projectId: task.projectId,
          projectManagerId: task.project.managerId,
          assignedToId: task.assignedToId,
          userName: 'System',
          action: ActivityAction.TASK_OVERDUE,
          message,
          createdAt: log.createdAt,
        });

        // Notify assigned developer if any
        if (task.assignedToId) {
          await ActivityService.createNotification({
            userId: task.assignedToId,
            taskId: task.id,
            type: NotificationType.TASK_OVERDUE,
            title: 'Task Overdue Alert',
            message: `Task #${task.taskNumber} "${task.title}" is past its due date.`,
          });
        }

        // Notify Project Manager
        if (task.project.managerId && task.project.managerId !== task.assignedToId) {
          await ActivityService.createNotification({
            userId: task.project.managerId,
            taskId: task.id,
            type: NotificationType.TASK_OVERDUE,
            title: 'Project Task Overdue',
            message: `Task #${task.taskNumber} in "${task.project.name}" is now overdue.`,
          });
        }
      }

      return overdueTasks.length;
    } catch (error) {
      console.error('Error checking overdue tasks in cron scheduler:', error);
      return 0;
    }
  }

  public static stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
    }
  }
}
