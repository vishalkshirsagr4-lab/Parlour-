import PushSubscription from '../models/PushSubscription.js';
import { getVapidPublicKey } from '../config/pushNotifications.js';

/**
 * Get VAPID public key for frontend
 */
export const getPublicKey = (req, res) => {
  try {
    const publicKey = getVapidPublicKey();
    if (!publicKey) {
      return res.status(503).json({
        message: 'Push notifications are not configured',
      });
    }
    res.status(200).json({ publicKey });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Subscribe user to push notifications
 */
export const subscribeToPushNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { endpoint, auth, p256dh } = req.body;

    if (!endpoint || !auth || !p256dh) {
      return res.status(400).json({
        message: 'Missing required subscription fields: endpoint, auth, p256dh',
      });
    }

    // Check if subscription already exists
    let subscription = await PushSubscription.findOne({ user: userId });

    if (subscription) {
      // Update existing subscription
      subscription.endpoint = endpoint;
      subscription.auth = auth;
      subscription.p256dh = p256dh;
      subscription.isActive = true;
      subscription.userAgent = req.headers['user-agent'];
    } else {
      // Create new subscription
      subscription = new PushSubscription({
        user: userId,
        endpoint,
        auth,
        p256dh,
        userAgent: req.headers['user-agent'],
      });
    }

    await subscription.save();

    res.status(201).json({
      message: 'Push subscription saved successfully',
      subscriptionId: subscription._id,
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Unsubscribe user from push notifications
 */
export const unsubscribeFromPushNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await PushSubscription.findOne({ user: userId });

    if (!subscription) {
      return res.status(404).json({
        message: 'No push subscription found',
      });
    }

    // Mark as inactive instead of deleting
    subscription.isActive = false;
    await subscription.save();

    res.status(200).json({
      message: 'Unsubscribed from push notifications',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Check if user has push subscription
 */
export const checkPushSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await PushSubscription.findOne({
      user: userId,
      isActive: true,
    });

    res.status(200).json({
      hasSubscription: !!subscription,
      subscriptionId: subscription?._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update push subscription status
 */
export const updatePushSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'isActive must be a boolean',
      });
    }

    const subscription = await PushSubscription.findOneAndUpdate(
      { user: userId },
      { isActive },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        message: 'No push subscription found',
      });
    }

    res.status(200).json({
      message: `Push notifications ${isActive ? 'enabled' : 'disabled'}`,
      subscription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
