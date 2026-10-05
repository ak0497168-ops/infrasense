import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { connectDB } from './server/config/db.js';
import { seedDatabase } from './server/seed/seed.js';
import authRoutes from './server/routes/auth.routes.js';
import reportRoutes from './server/routes/report.routes.js';
import insightsRoutes from './server/routes/insights.routes.js';
import notificationRoutes from './server/routes/notification.routes.js';
import adminRoutes from './server/routes/admin.routes.js';
import { errorHandler } from './server/middleware/error.middleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Initialize Database & Seed Baseline Data
  await connectDB();
  await seedDatabase();

  // Basic Middleware
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Ensure uploads directory exists and is statically served
  const uploadsPath = path.resolve(__dirname, process.env.UPLOAD_DIR || 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsPath));

  // Mount API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/insights', insightsRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'InfraSense API',
      timestamp: new Date().toISOString()
    });
  });

  // Centralized Error Handling Middleware for APIs
  app.use(errorHandler);

  // Frontend Integration: Vite Dev Server Middleware or Static Build
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[InfraSense] Platform running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[InfraSense] Server startup failure:', err);
  process.exit(1);
});
