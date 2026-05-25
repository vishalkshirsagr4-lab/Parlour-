import express from 'express';
import { getS3DeleteFailures, clearS3DeleteFailures } from '../config/s3.js';

const router = express.Router();

/**
 * Admin Diagnostics: Report S3 delete failures
 * GET /api/system/diagnostics/s3-failures
 * Returns: List of recent S3 delete failures (AccessDenied, etc.)
 */
router.get('/diagnostics/s3-failures', (req, res) => {
  try {
    const failures = getS3DeleteFailures();
    res.status(200).json({
      success: true,
      message: 'S3 delete failures',
      count: failures.length,
      failures,
      recommendation: failures.length > 0
        ? 'IAM policy does not allow s3:DeleteObject. See AWS_S3_IAM_FIX.md for remediation steps.'
        : 'No S3 delete failures detected. All image cleanups are working.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Admin Diagnostics: Clear S3 failure log
 * POST /api/system/diagnostics/clear-s3-failures
 * Returns: Number of failures cleared
 */
router.post('/diagnostics/clear-s3-failures', (req, res) => {
  try {
    const clearedCount = clearS3DeleteFailures();
    res.status(200).json({
      success: true,
      message: `Cleared ${clearedCount} S3 failure records`,
      clearedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Health Check: System and service readiness
 * GET /api/system/health
 * Returns: Service health status (DB, Email, S3, etc.)
 */
router.get('/health', async (req, res) => {
  try {
    const s3Failures = getS3DeleteFailures();
    const s3Status = s3Failures.length === 0 ? 'healthy' : 'degraded';

    res.status(200).json({
      success: true,
      message: 'System health check',
      timestamp: new Date().toISOString(),
      services: {
        s3: {
          status: s3Status,
          recentFailureCount: s3Failures.length,
          lastFailure: s3Failures.length > 0 ? s3Failures[s3Failures.length - 1] : null,
          recommendation: s3Status !== 'healthy'
            ? 'Fix IAM policy for s3-vishal user to allow s3:DeleteObject'
            : 'All S3 operations working normally',
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
