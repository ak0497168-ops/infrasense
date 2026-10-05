import mongoose from 'mongoose';
import { createDualModel } from './modelFactory.js';

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  reportId: { type: String, default: '' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['REPORT_SUBMITTED', 'RISK_ASSESSED', 'SIMILAR_DETECTED', 'STATUS_CHANGED', 'MAINTENANCE_SCHEDULED', 'RESOLVED', 'SYSTEM'],
    default: 'SYSTEM'
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const MongooseNotification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export const Notification = createDualModel(MongooseNotification, 'notifications');
export default Notification;
