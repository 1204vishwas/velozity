import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { env } from '../config/env';
import { Role } from '@prisma/client';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export class AuthController {
  public static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
      return;
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ userId: user.id });

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Set HttpOnly cookie
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(
      res,
      {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      },
      'Login successful'
    );
  }

  public static async refresh(req: Request, res: Response): Promise<void> {
    const token = req.cookies[REFRESH_COOKIE_NAME];

    if (!token) {
      sendError(res, 'Refresh token missing in HttpOnly cookie', 401, 'REFRESH_TOKEN_MISSING');
      return;
    }

    try {
      const decoded = verifyRefreshToken(token);

      // Check token in database
      const dbToken = await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
        res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
        sendError(res, 'Refresh token invalid or expired', 401, 'INVALID_REFRESH_TOKEN');
        return;
      }

      const user = dbToken.user;
      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };

      const newAccessToken = signAccessToken(payload);

      sendSuccess(
        res,
        {
          accessToken: newAccessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
          },
        },
        'Token refreshed successfully'
      );
    } catch (error) {
      res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
      sendError(res, 'Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  public static async logout(req: Request, res: Response): Promise<void> {
    const token = req.cookies[REFRESH_COOKIE_NAME];

    if (token) {
      await prisma.refreshToken
        .updateMany({
          where: { token },
          data: { revoked: true },
        })
        .catch(() => {});
    }

    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, null, 'Logged out successfully');
  }

  public static async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      sendError(res, 'User not found', 404, 'NOT_FOUND');
      return;
    }

    sendSuccess(res, user);
  }

  public static async getUsers(req: Request, res: Response): Promise<void> {
    const { role } = req.query;

    const whereClause: any = {};
    if (role && Object.values(Role).includes(role as Role)) {
      whereClause.role = role as Role;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });

    sendSuccess(res, users);
  }

  public static async signup(req: Request, res: Response): Promise<void> {
    const { name, email, password, role } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      sendError(res, 'An account with this email address already exists.', 409, 'USER_EXISTS');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role === Role.PROJECT_MANAGER ? Role.PROJECT_MANAGER : Role.DEVELOPER;

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: userRole,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0c87eb&color=fff`,
      },
    });

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ userId: user.id });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(
      res,
      {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      },
      'Account created successfully',
      201
    );
  }

  public static async socialLogin(req: Request, res: Response): Promise<void> {
    const { provider, email, name, avatarUrl, role } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Create new social user
      const randomPassword = Math.random().toString(36).slice(-10) + '!A1';
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const userRole = role === Role.PROJECT_MANAGER ? Role.PROJECT_MANAGER : Role.DEVELOPER;

      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: userRole,
          avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0c87eb&color=fff`,
        },
      });
    } else if (avatarUrl && !user.avatarUrl) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl },
      });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ userId: user.id });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(
      res,
      {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      },
      `Signed in with ${provider === 'google' ? 'Google' : 'Facebook'} successfully`
    );
  }
}
