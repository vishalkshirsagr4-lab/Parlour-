import express from 'express';
import {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendBroadcastNotification,
} from '../controllers/notificationController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/', authMiddleware, getNotifications);
router.put('/:id/read', authMiddleware, markAsRead);
router.put('/read-all', authMiddleware, markAllAsRead);
router.delete('/:id', authMiddleware, deleteNotification);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createNotification);
router.post('/broadcast', authMiddleware, adminMiddleware, sendBroadcastNotification);

export default router;
