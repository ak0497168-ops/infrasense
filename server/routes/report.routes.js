import express from 'express';
import { 
  createReport, 
  getMyReports, 
  getReportById, 
  analyzeImageEndpoint, 
  previewAnalyzeImage,
  submitFeedback,
  simulateStatusAdvance 
} from '../controllers/report.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate, feedbackSchema } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, upload.array('evidenceFiles', 5), createReport);
router.post('/preview-analyze', authMiddleware, previewAnalyzeImage);
router.get('/my', authMiddleware, getMyReports);
router.get('/:id', authMiddleware, getReportById);
router.post('/:id/analyze-image', authMiddleware, analyzeImageEndpoint);
router.post('/:id/feedback', authMiddleware, validate(feedbackSchema), submitFeedback);
router.post('/:id/advance-status', authMiddleware, simulateStatusAdvance);

export default router;
