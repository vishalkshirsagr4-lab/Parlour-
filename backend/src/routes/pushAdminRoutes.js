import express from 'express';
import {
  sendTestNotification,
  sendPromotionalNotification,
  getPushSubscriptionStats,
  fixSubscriptionsActiveStatus,
  viewPushNotificationLogs,
} from '../controllers/pushAdminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Admin-only routes for managing push notifications
router.post('/test', authMiddleware, adminMiddleware, sendTestNotification);
router.post('/promotional', authMiddleware, adminMiddleware, sendPromotionalNotification);
router.get('/stats', authMiddleware, adminMiddleware, getPushSubscriptionStats);
router.post('/fix-subscriptions', authMiddleware, adminMiddleware, fixSubscriptionsActiveStatus);
router.get('/logs', authMiddleware, adminMiddleware, viewPushNotificationLogs);

export default router;
