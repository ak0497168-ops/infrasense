import express from 'express';
import { adminLogin } from '../controllers/auth.controller.js';
import {
  getDashboard,
  getReports,
  getReportById,
  updateStatus,
  addInternalNote,
  scheduleMaintenance,
  resolveReport,
  getAnalytics,
  getInfrastructure,
  getUsers,
  getAdminNotifications
} from '../controllers/admin.controller.js';
import { adminMiddleware } from '../middleware/auth.middleware.js';
import { validate, loginSchema } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public Admin Login
router.post('/login', validate(loginSchema), adminLogin);

// Protected Admin Routes
router.get('/dashboard', adminMiddleware, getDashboard);
router.get('/reports', adminMiddleware, getReports);
router.get('/reports/:id', adminMiddleware, getReportById);

router.patch('/reports/:id/status', adminMiddleware, updateStatus);
router.post('/reports/:id/notes', adminMiddleware, addInternalNote);
router.post('/reports/:id/schedule', adminMiddleware, scheduleMaintenance);
router.post('/reports/:id/resolve', adminMiddleware, resolveReport);

router.get('/analytics', adminMiddleware, getAnalytics);
router.get('/infrastructure', adminMiddleware, getInfrastructure);
router.get('/users', adminMiddleware, getUsers);
router.get('/notifications', adminMiddleware, getAdminNotifications);

export default router;
