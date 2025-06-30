// app.js
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import morgan from 'morgan';

import errorMiddlware from './middlewares/error.middleware.js';
import courseRoutes from './routes/course.Routes.js';
import miscRoutes from './routes/miscellanous.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import userRoutes from './routes/user.Routes.js';

config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: 'http://localhost:5173', // ✅ or use vercel url if deploying frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
);

app.use(cookieParser());
app.use(morgan('dev'));

// ✅ Root route — this should come before 404 handler
app.get('/', (_req, res) => {
  res.send('✅ Server is up and running!');
});

app.use('/ping', (_req, res) => {
  res.send('Pong');
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1', miscRoutes);

// ❌ 404 catch-all route (keep this last)
app.all('*', (_req, res) => {
  res.status(404).send('OOPS!!  404 page not found ');
});

// Global error handler
app.use(errorMiddlware);

export default app;
