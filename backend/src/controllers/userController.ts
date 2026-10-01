import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';
import { updateProfileSchema } from '../validators/schemas';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, firstName: true, lastName: true, username: true, email: true },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const userId = req.user!.id;

    const existing = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: userId } },
          { OR: [{ email: validated.email }, { username: validated.username }] },
        ],
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Email or Username is already in use by another user' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validated,
      select: { id: true, firstName: true, lastName: true, username: true, email: true },
    });

    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ message: error.errors?.[0]?.message || error.message });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Compare against user.passwordHash
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // 2. Hash new password and save to passwordHash field
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    res.json({ message: 'Password updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating password' });
  }
};