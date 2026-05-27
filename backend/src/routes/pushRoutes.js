import express from 'express';
import {
  getPublicKey,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  checkPushSubscription,
  updatePushSubscriptionStatus,
} from '../controllers/pushController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public endpoint - get VAPID public key
router.get('/public-key', getPublicKey);

// Protected endpoints - require authentication
router.post('/subscribe', authMiddleware, subscribeToPushNotifications);
router.post('/unsubscribe', authMiddleware, unsubscribeFromPushNotifications);
router.get('/check', authMiddleware, checkPushSubscription);
router.put('/status', authMiddleware, updatePushSubscriptionStatus);

export default router;
