import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { Role, TaskStatus, TaskPriority, ActivityAction } from '@prisma/client';
import { ActivityService } from '../services/activity.service';
import { socketService } from '../services/socket.service';

export class TaskController {
  public static async getTasks(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const {
      status,
      priority,
      dueStart,
      dueEnd,
      projectId,
      isOverdue,
      search,
    } = req.query as Record<string, string | undefined>;

    const where: any = {};

    // 1. Role-based scoping
    if (user.role === Role.ADMIN) {
      if (projectId) {
        where.projectId = projectId;
      }
    } else if (user.role === Role.PROJECT_MANAGER) {
      // PM can only see tasks from projects they manage
      where.project = {
        managerId: user.userId,
      };
      if (projectId) {
        where.projectId = projectId;
      }
    } else if (user.role === Role.DEVELOPER) {
      // Developer can ONLY see tasks assigned to them
      where.assignedToId = user.userId;
      if (projectId) {
        where.projectId = projectId;
      }
    }

    // 2. Filter by status
    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      where.status = status as TaskStatus;
    }

    // 3. Filter by priority
    if (priority && Object.values(TaskPriority).includes(priority as TaskPriority)) {
      where.priority = priority as TaskPriority;
    }

    // 4. Filter by overdue
    if (isOverdue === 'true') {
      where.isOverdue = true;
    } else if (isOverdue === 'false') {
      where.isOverdue = false;
    }

    // 5. Filter by due date range
    if (dueStart || dueEnd) {
      where.dueDate = {};
      if (dueStart) {
        where.dueDate.gte = new Date(dueStart);
      }
      if (dueEnd) {
        where.dueDate.lte = new Date(dueEnd);
      }
    }

    // 6. Search query
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, managerId: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    sendSuccess(res, tasks);
  }

  public static async getTaskById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    // Task access pre-verified by checkTaskAccess middleware
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, managerId: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!task) {
      sendError(res, 'Task not found', 404, 'NOT_FOUND');
      return;
    }

    sendSuccess(res, task);
  }

  public static async createTask(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const { title, description, status, priority, dueDate, projectId, assignedToId } = req.body;

    // Verify project exists and caller has authority over it
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      sendError(res, 'Project not found', 404, 'NOT_FOUND');
      return;
    }

    if (user.role === Role.PROJECT_MANAGER && project.managerId !== user.userId) {
      sendError(res, 'Forbidden: You can only add tasks to your own projects', 403, 'FORBIDDEN');
      return;
    }

    const taskDueDate = new Date(dueDate);
    const isPastDue = taskDueDate < new Date() && status !== TaskStatus.DONE;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || TaskStatus.TODO,
        priority: priority || TaskPriority.MEDIUM,
        dueDate: taskDueDate,
        isOverdue: isPastDue,
        projectId,
        assignedToId: assignedToId || null,
        createdById: user.userId,
      },
      include: {
        project: { select: { id: true, name: true, managerId: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Record creation in activity log
    await prisma.activityLog.create({
      data: {
        taskId: task.id,
        projectId: task.projectId,
        userId: user.userId,
        action: ActivityAction.TASK_CREATED,
        message: `${user.name} created Task #${task.taskNumber}: "${task.title}"`,
      },
    });

    // Notify assigned developer if specified
    if (assignedToId) {
      await ActivityService.notifyTaskAssigned(task.id, assignedToId, user.name);
    }

    // Broadcast creation to project room
    socketService.broadcastTaskUpdate(task.projectId, 'task:created', task);

    sendSuccess(res, task, 'Task created successfully', 201);
  }

  public static async updateTaskDetails(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const { id } = req.params;
    const { title, description, priority, dueDate, assignedToId, status } = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!existingTask) {
      sendError(res, 'Task not found', 404, 'NOT_FOUND');
      return;
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) {
      updateData.dueDate = new Date(dueDate);
      if (updateData.dueDate < new Date() && (status || existingTask.status) !== TaskStatus.DONE) {
        updateData.isOverdue = true;
      } else {
        updateData.isOverdue = false;
      }
    }
    if (assignedToId !== undefined) {
      updateData.assignedToId = assignedToId || null;
    }
    if (status !== undefined && Object.values(TaskStatus).includes(status)) {
      updateData.status = status;
      if (status === TaskStatus.DONE) {
        updateData.isOverdue = false;
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, managerId: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // If assigned to a new developer, notify them
    if (
      assignedToId &&
      assignedToId !== existingTask.assignedToId
    ) {
      await ActivityService.notifyTaskAssigned(updatedTask.id, assignedToId, user.name);
    }

    // If status changed, log activity and trigger notification if moved to IN_REVIEW
    if (status && status !== existingTask.status) {
      await ActivityService.logStatusChange({
        taskId: updatedTask.id,
        userId: user.userId,
        userName: user.name,
        fromStatus: existingTask.status,
        toStatus: status,
      });
    }

    socketService.broadcastTaskUpdate(updatedTask.projectId, 'task:updated', updatedTask);

    sendSuccess(res, updatedTask, 'Task details updated successfully');
  }

  public static async updateTaskStatus(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const { id } = req.params;
    const { status } = req.body as { status: TaskStatus };

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!existingTask) {
      sendError(res, 'Task not found', 404, 'NOT_FOUND');
      return;
    }

    const fromStatus = existingTask.status;
    const toStatus = status;

    if (fromStatus === toStatus) {
      sendSuccess(res, existingTask, 'Status unchanged');
      return;
    }

    // Determine if task is overdue when status changes (if completed, it's no longer overdue)
    const isOverdue =
      toStatus === TaskStatus.DONE ? false : existingTask.dueDate < new Date();

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: toStatus,
        isOverdue,
      },
      include: {
        project: { select: { id: true, name: true, managerId: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Record activity and trigger real-time updates and notifications
    await ActivityService.logStatusChange({
      taskId: updatedTask.id,
      userId: user.userId,
      userName: user.name,
      fromStatus,
      toStatus,
    });

    sendSuccess(res, updatedTask, 'Task status updated successfully');
  }

  public static async deleteTask(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!task) {
      sendError(res, 'Task not found', 404, 'NOT_FOUND');
      return;
    }

    await prisma.task.delete({
      where: { id },
    });

    socketService.broadcastTaskUpdate(task.projectId, 'task:deleted', { id });

    sendSuccess(res, null, 'Task deleted successfully');
  }
}
