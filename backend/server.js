import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import 'dotenv/config';

import { connectDB } from './src/config/database.js';
import { handleSocketEvents } from './src/sockets/events.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import serviceRoutes from './src/routes/serviceRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import galleryRoutes from './src/routes/galleryRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import staffRoutes from './src/routes/staffRoutes.js';

import dns from 'dns';
import { createAdmin } from './scripts/createAdmin.js';

// Use Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Initialize app
const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Connect Database

// Middleware
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply rate limiting only in production to avoid blocking local development
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
} else {
  console.log('Rate limiter disabled in development environment');
}
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Socket.io connection
io.on('connection', (socket) => {
  handleSocketEvents(io, socket);
});

app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/staff', staffRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await createAdmin();

    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
      console.log('✓ Admin user check complete');
    });
  } catch (err) {
    console.error('✗ Server startup failed:', err);
    process.exit(1);
  }
};

startServer();
