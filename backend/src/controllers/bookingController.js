import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import { sendBookingConfirmation } from '../config/email.js';
import { sendBookingNotification } from '../config/pushNotifications.js';

export const createBooking = async (req, res) => {
  try {
    const { serviceId, date, timeSlot, staffId, notes } = req.body;
    const userId = req.user.id;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const booking = new Booking({
      user: userId,
      service: serviceId,
      staff: staffId,
      date: new Date(date),
      timeSlot,
      notes,
      price: service.price,
      discount: service.discount,
      totalAmount: service.finalPrice,
    });

    await booking.save();
    await booking.populate('service user');

    // Send push notification asynchronously
    try {
      await sendBookingNotification(userId, {
        bookingId: booking._id.toString(),
        serviceName: service.title,
        date: booking.date.toLocaleDateString(),
      }, 'created');
    } catch (notificationError) {
      console.error('Failed to send booking notification:', notificationError.message);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId })
      .populate('service staff')
      .sort('-createdAt');

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('service')
      .populate({ path: 'staff' })
      .populate({ path: 'user', select: 'name email bio' });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id).populate('user service');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;

    if (status === 'completed') {
      booking.completedAt = new Date();
    }

    await booking.save();

    // Send email notification
    if (booking.user.email) {
      await sendBookingConfirmation(booking.user.email, {
        serviceName: booking.service.title,
        date: booking.date.toLocaleDateString(),
        time: booking.timeSlot,
        status,
      });
    }

    // Send push notification asynchronously
    try {
      const notificationMap = {
        confirmed: 'confirmed',
        completed: 'completed',
        cancelled: 'cancelled',
      };

      const notificationType = notificationMap[status];
      if (notificationType) {
        await sendBookingNotification(booking.user._id.toString(), {
          bookingId: booking._id.toString(),
          serviceName: booking.service.title,
          date: booking.date.toLocaleDateString(),
        }, notificationType);
      }
    } catch (notificationError) {
      console.error('Failed to send status notification:', notificationError.message);
      // Don't fail the request if notification fails
    }

    res.status(200).json({
      message: 'Booking status updated',
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;

    await booking.save();

    res.status(200).json({
      message: 'Booking cancelled',
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};

    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .sort('-date')
      .populate('service')
      .populate({ path: 'staff' })
      .populate({ path: 'user', select: 'name email bio' });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
