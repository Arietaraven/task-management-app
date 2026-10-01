import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { sendResetPasswordEmail } from '../utils/mailer';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/schemas';

export const register = async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: validated.email }, { username: validated.username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email or Username already exists' });
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: validated.firstName,
        lastName: validated.lastName,
        username: validated.username,
        email: validated.email,
        passwordHash,
      },
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.errors?.[0]?.message || error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: validated.email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.errors?.[0]?.message || error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const validated = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: validated.email } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      await prisma.passwordReset.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt,
        },
      });

      await sendResetPasswordEmail(user.email, resetToken);
    }

    // Always respond with success to prevent user enumeration
    res.json({ message: 'If an account associated with this email exists, password reset instructions have been sent.' });
  } catch (error: any) {
    res.status(400).json({ message: error.errors?.[0]?.message || error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const validated = resetPasswordSchema.parse(req.body);

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token: validated.token },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const newPasswordHash = await bcrypt.hash(validated.newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error: any) {
    res.status(400).json({ message: error.errors?.[0]?.message || error.message });
  }
};