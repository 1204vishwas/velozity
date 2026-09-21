import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export class ClientController {
  public static async getClients(req: Request, res: Response): Promise<void> {
    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    sendSuccess(res, clients);
  }

  public static async createClient(req: Request, res: Response): Promise<void> {
    const { name, company, email, phone } = req.body;

    const client = await prisma.client.create({
      data: {
        name,
        company,
        email,
        phone: phone || null,
      },
    });

    sendSuccess(res, client, 'Client created successfully', 201);
  }

  public static async updateClient(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, company, email, phone } = req.body;

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(company && { company }),
        ...(email && { email }),
        ...(phone !== undefined && { phone: phone || null }),
      },
    });

    sendSuccess(res, client, 'Client updated successfully');
  }

  public static async deleteClient(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    await prisma.client.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Client deleted successfully');
  }
}
