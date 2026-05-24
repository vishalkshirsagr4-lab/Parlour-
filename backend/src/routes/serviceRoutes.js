import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin routes
router.post('/categories', authMiddleware, adminMiddleware, upload.single('image'), createCategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, upload.single('image'), updateCategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, deleteCategory);

router.post('/', authMiddleware, adminMiddleware, upload.array('images'), createService);
router.put('/:id', authMiddleware, adminMiddleware, upload.array('images'), updateService);
router.delete('/:id', authMiddleware, adminMiddleware, deleteService);

export default router;
