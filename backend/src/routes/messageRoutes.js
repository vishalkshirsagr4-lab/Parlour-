import express from 'express';
import {
  sendMessage,
  getMessages,
  getConversations,
} from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', authMiddleware, upload.single('image'), sendMessage);
router.get('/conversation/:otherUserId', authMiddleware, getMessages);
router.get('/', authMiddleware, getConversations);

export default router;
