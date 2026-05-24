import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
} from '../controllers/bookingController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/', authMiddleware, createBooking);
router.get('/my-bookings', authMiddleware, getBookings);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/cancel', authMiddleware, cancelBooking);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllBookings);
router.put('/:id/status', authMiddleware, adminMiddleware, updateBookingStatus);

export default router;
