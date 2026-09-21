import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { env } from '../config/env';
import { Role } from '@prisma/client';

export interface ActivityPayload {
  id: string;
  taskId?: string | null;
  taskNumber?: number | null;
  projectId: string;
  projectManagerId: string;
  assignedToId?: string | null;
  userId?: string | null;
  userName?: string;
  action: string;
  message: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  createdAt: string | Date;
}

class SocketService {
  private io: Server | null = null;
  // Map of userId -> Set of socket IDs (to support multiple tabs/devices per user)
  private userSockets: Map<string, Set<string>> = new Map();

  public initialize(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: env.CORS_ORIGIN,
        credentials: true,
      },
      pingTimeout: 30000,
      pingInterval: 25000,
    });

    // Authentication middleware for WebSocket handshake
    this.io.use((socket: Socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication required for WebSocket connection'));
        }

        const user = verifyAccessToken(token);
        socket.data.user = user;
        next();
      } catch (err: any) {
        next(new Error('Invalid token for WebSocket connection'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user: TokenPayload = socket.data.user;
      this.handleUserConnect(socket, user);

      // Room joining for active project viewers
      socket.on('project:join', (projectId: string) => {
        if (projectId) {
          socket.join(`project:${projectId}`);
        }
      });

      socket.on('project:leave', (projectId: string) => {
        if (projectId) {
          socket.leave(`project:${projectId}`);
        }
      });

      socket.on('disconnect', () => {
        this.handleUserDisconnect(socket, user);
      });
    });

    return this.io;
  }

  private handleUserConnect(socket: Socket, user: TokenPayload): void {
    const userId = user.userId;

    // Join personal user room for direct notifications and developer task events
    socket.join(`user:${userId}`);

    // Join role room
    if (user.role === Role.ADMIN) {
      socket.join('role:ADMIN');
    } else if (user.role === Role.PROJECT_MANAGER) {
      socket.join('role:PROJECT_MANAGER');
    }

    // Update presence
    let sockets = this.userSockets.get(userId);
    if (!sockets) {
      sockets = new Set();
      this.userSockets.set(userId, sockets);
    }
    sockets.add(socket.id);

    this.broadcastPresence();
  }

  private handleUserDisconnect(socket: Socket, user: TokenPayload): void {
    if (!user) return;
    const userId = user.userId;
    const sockets = this.userSockets.get(userId);

    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    this.broadcastPresence();
  }

  public getOnlineUserCount(): number {
    return this.userSockets.size;
  }

  public getOnlineUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }

  public broadcastPresence(): void {
    if (!this.io) return;
    const presenceData = {
      activeCount: this.getOnlineUserCount(),
      onlineUserIds: this.getOnlineUserIds(),
    };
    // Emit presence updates to all connected clients
    this.io.emit('presence:update', presenceData);
  }

  /**
   * Broadcast activity event with strict role targeting:
   * 1. Admin: receives all events in global feed via 'role:ADMIN'
   * 2. Project Manager: receives events for projects they manage via 'user:{managerId}'
   * 3. Developer: receives events ONLY for tasks assigned to them via 'user:{assignedToId}'
   * 4. Project Room: any user currently viewing the project gets live real-time task update
   */
  public broadcastActivity(activity: ActivityPayload): void {
    if (!this.io) return;

    // 1. Admin global feed
    this.io.to('role:ADMIN').emit('activity:new', activity);

    // 2. Project Manager of this project
    if (activity.projectManagerId) {
      this.io.to(`user:${activity.projectManagerId}`).emit('activity:new', activity);
    }

    // 3. Developer assigned to the task (if different from manager and exists)
    if (
      activity.assignedToId &&
      activity.assignedToId !== activity.projectManagerId
    ) {
      this.io.to(`user:${activity.assignedToId}`).emit('activity:new', activity);
    }

    // 4. Live viewers of the project room (for instant board/table synchronization)
    this.io.to(`project:${activity.projectId}`).emit('task:status_changed', {
      taskId: activity.taskId,
      projectId: activity.projectId,
      fromStatus: activity.fromStatus,
      toStatus: activity.toStatus,
      updatedBy: activity.userName,
      createdAt: activity.createdAt,
    });
  }

  /**
   * Notify project viewers of general task changes (creation, edit, deletion)
   */
  public broadcastTaskUpdate(projectId: string, event: 'task:created' | 'task:updated' | 'task:deleted', taskData: any): void {
    if (!this.io) return;
    this.io.to(`project:${projectId}`).emit(event, taskData);
  }

  /**
   * Send notification to a specific user
   */
  public emitNotification(userId: string, notification: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('notification:new', notification);
  }

  /**
   * Emit updated unread notification count
   */
  public emitUnreadCount(userId: string, count: number): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('notification:unread_count', { count });
  }

  public getIO(): Server | null {
    return this.io;
  }
}

export const socketService = new SocketService();
