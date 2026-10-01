import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 1. Initialize environment variables FIRST
dotenv.config();

// 2. Import routes AFTER dotenv is loaded
import routes from './routes/api';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});