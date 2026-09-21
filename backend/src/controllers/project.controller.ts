import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { Role } from '@prisma/client';

export class ProjectController {
  public static async getProjects(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    let whereClause: any = {};

    if (user.role === Role.ADMIN) {
      whereClause = {};
    } else if (user.role === Role.PROJECT_MANAGER) {
      // PM can ONLY see their own managed projects
      whereClause = { managerId: user.userId };
    } else if (user.role === Role.DEVELOPER) {
      // Developer can ONLY see projects where they have assigned tasks
      whereClause = {
        tasks: {
          some: { assignedToId: user.userId },
        },
      };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, name: true, company: true },
        },
        manager: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    sendSuccess(res, projects);
  }

  public static async getProjectById(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const { id } = req.params;

    // Project is pre-verified by checkProjectAccess middleware
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        manager: {
          select: { id: true, name: true, email: true, role: true },
        },
        tasks: {
          // If developer, only include their assigned tasks
          where: user.role === Role.DEVELOPER ? { assignedToId: user.userId } : {},
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        },
        activityLogs: {
          take: 15,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!project) {
      sendError(res, 'Project not found', 404, 'NOT_FOUND');
      return;
    }

    sendSuccess(res, project);
  }

  public static async createProject(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const { name, description, clientId, status } = req.body;
    let managerId = req.body.managerId;

    // PM can only create projects for themselves
    if (user.role === Role.PROJECT_MANAGER) {
      managerId = user.userId;
    } else if (!managerId) {
      managerId = user.userId;
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      sendError(res, 'Client not found', 404, 'NOT_FOUND');
      return;
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        clientId,
        managerId,
        status: status || 'ACTIVE',
      },
      include: {
        client: true,
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    sendSuccess(res, project, 'Project created successfully', 201);
  }

  public static async updateProject(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, description, clientId, managerId, status } = req.body;
    const user = req.user!;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (clientId !== undefined) updateData.clientId = clientId;
    if (status !== undefined) updateData.status = status;

    // Only Admin can reassign manager
    if (user.role === Role.ADMIN && managerId !== undefined) {
      updateData.managerId = managerId;
    }

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    sendSuccess(res, updated, 'Project updated successfully');
  }

  public static async deleteProject(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Project deleted successfully');
  }
}
