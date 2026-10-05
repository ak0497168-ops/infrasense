import mongoose from 'mongoose';
import { createDualModel } from './modelFactory.js';

const maintenanceRecordSchema = new mongoose.Schema({
  infrastructureId: { type: String },
  infrastructureType: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  workDone: { type: String, required: true },
  cost: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now },
  frequencyScore: { type: Number, default: 50 }, // 0 to 100 indicator of past repair frequency
  createdAt: { type: Date, default: Date.now }
});

const MongooseMaintenanceRecord = mongoose.models.MaintenanceRecord || mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
export const MaintenanceRecord = createDualModel(MongooseMaintenanceRecord, 'maintenanceRecords');
export default MaintenanceRecord;
