import express from 'express';
import {
  uploadGalleryImage,
  getGallery,
  deleteGalleryImage,
  likeGalleryImage,
  saveGalleryImage,
} from '../controllers/galleryController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getGallery);

// User routes
router.post('/:id/like', authMiddleware, likeGalleryImage);
router.post('/:id/save', authMiddleware, saveGalleryImage);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), uploadGalleryImage);
router.delete('/:id', authMiddleware, adminMiddleware, deleteGalleryImage);

export default router;
