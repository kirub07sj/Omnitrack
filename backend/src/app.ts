import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Basic health check route to verify connection
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running and connected successfully!' });
});

export default app;
