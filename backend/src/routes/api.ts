import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController';
import { getTasks, getTaskById, createTask, updateTask, deleteTask, getDashboardStats } from '../controllers/taskController';
import { getProfile, updateProfile, changePassword } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  taskSchema, 
  updateProfileSchema 
} from '../validators/schemas';


const router = Router();

// Pass authLimiter as middleware before controller functions:
router.post('/auth/login', authLimiter, login);
router.post('/auth/register', authLimiter, register);
router.post('/auth/forgot-password', authLimiter, forgotPassword);
router.post('/auth/reset-password', authLimiter, resetPassword);


// Auth Routes
router.post('/auth/register', validate(registerSchema), register);
router.post('/auth/login', validate(loginSchema), login);
router.post('/auth/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/auth/reset-password', validate(resetPasswordSchema), resetPassword);

// Authenticated Routes
router.use(authenticateToken);

// User Profile
router.get('/users/profile', getProfile);
router.put('/users/profile', validate(updateProfileSchema), updateProfile);
router.put('/users/change-password', authenticateToken, changePassword);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Tasks
router.get('/tasks', getTasks);
router.get('/tasks/:id', getTaskById);
router.post('/tasks', validate(taskSchema), createTask);
router.put('/tasks/:id', validate(taskSchema), updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;