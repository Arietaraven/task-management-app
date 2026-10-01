import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController';
import { getTasks, getTaskById, createTask, updateTask, deleteTask, getDashboardStats } from '../controllers/taskController';
import { getProfile, updateProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

// Authenticated Routes
router.use(authenticateToken);

// User Profile
router.get('/users/profile', getProfile);
router.put('/users/profile', updateProfile);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Tasks
router.get('/tasks', getTasks);
router.get('/tasks/:id', getTaskById);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;