import express from 'express';
import {
  getUserProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  addFavorite,
  removeFavorite,
  getFavorites,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
} from '../controllers/userController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// User routes
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, upload.single('profileImage'), updateProfile);

router.post('/address', authMiddleware, addAddress);
router.put('/address/:addressId', authMiddleware, updateAddress);
router.delete('/address/:addressId', authMiddleware, deleteAddress);

router.post('/favorites', authMiddleware, addFavorite);
router.delete('/favorites', authMiddleware, removeFavorite);
router.get('/favorites', authMiddleware, getFavorites);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.put('/:userId/block', authMiddleware, adminMiddleware, blockUser);
router.put('/:userId/unblock', authMiddleware, adminMiddleware, unblockUser);
router.delete('/:userId', authMiddleware, adminMiddleware, deleteUser);

export default router;
