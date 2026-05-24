import express from 'express';
import {
  createStaff,
  getStaff,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getStaff);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createStaff);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateStaff);
router.delete('/:id', authMiddleware, adminMiddleware, deleteStaff);

export default router;
