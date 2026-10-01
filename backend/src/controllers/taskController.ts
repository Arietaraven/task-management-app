import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';
import { taskSchema } from '../validators/schemas';

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status, priority, search } = req.query;

    const whereClause: any = { userId };

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (search) {
      whereClause.title = { contains: String(search), mode: 'insensitive' };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const task = await prisma.task.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch task' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = taskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: {
        ...validated,
        dueDate: new Date(validated.dueDate),
        userId: req.user!.id,
      },
    });

    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ message: error.errors?.[0]?.message || error.message });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const validated = taskSchema.parse(req.body);

    const existingTask = await prisma.task.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existingTask) return res.status(404).json({ message: 'Task not found' });

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...validated,
        dueDate: new Date(validated.dueDate),
      },
    });

    res.json(updatedTask);
  } catch (error: any) {
    res.status(400).json({ message: error.errors?.[0]?.message || error.message });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    const existingTask = await prisma.task.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existingTask) return res.status(404).json({ message: 'Task not found' });

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const now = new Date();

    const [total, toDo, inProgress, completed, overdue] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'TO_DO' } }),
      prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.task.count({
        where: {
          userId,
          dueDate: { lt: now },
          status: { not: 'COMPLETED' },
        },
      }),
    ]);

    res.json({ total, toDo, inProgress, completed, overdue });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch dashboard metrics' });
  }
};