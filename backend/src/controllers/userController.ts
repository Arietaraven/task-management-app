import { Response } from 'express';
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