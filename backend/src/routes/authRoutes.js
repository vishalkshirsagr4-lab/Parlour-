import express from 'express';
import {
  registerWithEmail,
  verifyOTPAndRegister,
  loginWithEmail,
  verifyOTPAndLogin,
  googleAuth,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerWithEmail);
router.post('/verify-register', verifyOTPAndRegister);
router.post('/login', loginWithEmail);
router.post('/verify-login', verifyOTPAndLogin);
router.post('/google', googleAuth);
router.post('/refresh', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
