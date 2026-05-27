import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendPushNotificationToUser } from '../config/pushNotifications.js';

export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, relatedBooking } = req.body;

    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      relatedBooking,
    });

    await notification.save();

    // Emit realtime notification to the user's socket room if io is available
    try {
      const io = req.app && req.app.get && req.app.get('io')
      if (io && notification && notification.user) {
        io.to(`user-${notification.user}`).emit('receive-notification', notification)
      }
    } catch (emitErr) {
      console.error('Failed to emit notification via socket.io', emitErr)
    }

    // Send push notification asynchronously
    try {
      await sendPushNotificationToUser(userId, {
        title: title || '📬 New Notification',
        body: message,
        icon: '/icons/icon-192.svg',
        data: {
          type: type || 'notification',
          notificationId: notification._id.toString(),
        },
      });
    } catch (pushError) {
      console.error('Failed to send push notification:', pushError.message);
      // Don't fail the request if push notification fails
    }

    res.status(201).json({
      message: 'Notification created',
      notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: userId })
      .populate('relatedBooking')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Notification.countDocuments({ user: userId });

    res.status(200).json({
      notifications,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Notification deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendBroadcastNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    const users = await User.find({});

    const notifications = users.map((user) => ({
      user: user._id,
      title,
      message,
      type,
    }));

    const inserted = await Notification.insertMany(notifications);

    // Emit broadcast to all connected clients
    try {
      const io = req.app && req.app.get && req.app.get('io')
      if (io) {
        // Emit single event per inserted notification to target user's room
        inserted.forEach((notif) => {
          if (notif && notif.user) {
            io.to(`user-${notif.user}`).emit('receive-notification', notif)
          }
        })
      }
    } catch (emitErr) {
      console.error('Failed to emit broadcast notifications via socket.io', emitErr)
    }

    // Send push notifications to all users asynchronously
    try {
      const pushNotificationPromises = users.map((user) =>
        sendPushNotificationToUser(user._id.toString(), {
          title: title || '📢 Broadcast Notification',
          body: message,
          icon: '/icons/icon-192.svg',
          badge: '/icons/badge-72.svg',
          data: {
            type: type || 'broadcast',
          },
        }).catch((err) => {
          console.error(`Failed to send push notification to user ${user._id}:`, err.message);
          // Don't fail if individual notifications fail
        })
      );
      await Promise.allSettled(pushNotificationPromises);
    } catch (pushError) {
      console.error('Error sending broadcast push notifications:', pushError.message);
      // Don't fail the request if push notifications fail
    }

    res.status(201).json({
      message: `Notification sent to ${users.length} users`,
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
