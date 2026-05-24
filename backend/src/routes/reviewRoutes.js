import express from 'express';
import {
  createReview,
  getRecentReviews,
  getServiceReviews,
  updateReview,
  deleteReview,
  likeReview,
  reportReview,
} from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/recent', getRecentReviews);
router.get('/service/:serviceId', getServiceReviews);

// User routes
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  createReview
);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);
router.post('/:id/like', authMiddleware, likeReview);
router.post('/:id/report', authMiddleware, reportReview);

export default router;
