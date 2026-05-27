import {
  sendPushNotificationToUser,
  sendPushNotificationToUsers,
  sendPromoNotification,
} from '../config/pushNotifications.js';

/**
 * Admin endpoint to send a test push notification to a specific user
 * Used for testing and debugging
 */
export const sendTestNotification = async (req, res) => {
  try {
    const { userId: requestedUserId, title, body, icon, data } = req.body;
    const userId = requestedUserId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        message: 'userId is required',
      });
    }

    const notificationData = {
      title: title || '📬 Test Notification',
      body: body || 'This is a test notification from your salon app',
      icon: icon || '/icons/icon-192.svg',
      data: data || { type: 'test' },
    };

    await sendPushNotificationToUser(userId, notificationData);

    res.status(200).json({
      message: 'Test notification sent successfully',
      userId,
      notification: notificationData,
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Admin endpoint to send promotional notification to multiple users
 */
export const sendPromotionalNotification = async (req, res) => {
  try {
    const { userIds, title, body, icon, promoId, link } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        message: 'userIds array is required and must not be empty',
      });
    }

    const results = await sendPromoNotification(userIds, {
      title: title || '🎉 Special Offer',
      body: body || 'Check out our latest promotions',
      icon: icon || '/icons/icon-192.svg',
      promoId: promoId || 'promo-' + Date.now(),
      link: link || '/',
    });

    res.status(200).json({
      message: 'Promotional notifications sent',
      results,
    });
  } catch (error) {
    console.error('Error sending promotional notifications:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Admin endpoint to get push subscription statistics
 */
export const getPushSubscriptionStats = async (req, res) => {
  try {
    const PushSubscription = (
      await import('../models/PushSubscription.js')
    ).default;

    const total = await PushSubscription.countDocuments();
    const active = await PushSubscription.countDocuments({ isActive: true });
    const inactive = await PushSubscription.countDocuments({ isActive: false });
    const noActiveField = await PushSubscription.countDocuments({ isActive: { $exists: false } });

    const recentlyUsed = await PushSubscription.countDocuments({
      lastUsed: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    console.log('[Push] Stats - Total:', total, 'Active:', active, 'Inactive:', inactive, 'Missing isActive:', noActiveField);

    res.status(200).json({
      stats: {
        total,
        active,
        inactive,
        missingActiveField: noActiveField,
        recentlyUsed,
        inactivePercentage: ((inactive / total) * 100).toFixed(2) + '%',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Admin endpoint to fix subscriptions missing isActive field
 * Sets all subscriptions without isActive to true
 */
export const fixSubscriptionsActiveStatus = async (req, res) => {
  try {
    const PushSubscription = (
      await import('../models/PushSubscription.js')
    ).default;

    console.log('[Push] Running subscription fix...');

    // Fix subscriptions that don't have isActive field
    const updateResult = await PushSubscription.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );

    console.log(`[Push] Fixed ${updateResult.modifiedCount} subscriptions`);

    res.status(200).json({
      message: 'Subscription fix completed',
      updated: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error('[Push] Error fixing subscriptions:', error);
    res.status(500).json({ message: error.message });
  }
};
  }
};

/**
 * Admin endpoint to view recent push notifications
 * (This would require a separate NotificationLog model)
 */
export const viewPushNotificationLogs = async (req, res) => {
  try {
    // Note: This would require implementing a NotificationLog model
    // For now, return instructions
    res.status(200).json({
      message: 'Push notification logging not yet implemented',
      tip: 'Consider adding a NotificationLog model to track sent notifications',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
