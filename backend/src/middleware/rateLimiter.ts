import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { message: 'Too many login/registration attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});