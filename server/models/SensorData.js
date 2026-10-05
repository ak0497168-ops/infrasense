import mongoose from 'mongoose';
import { createDualModel } from './modelFactory.js';

const sensorDataSchema = new mongoose.Schema({
  infrastructureType: { type: String, required: true },
  sensorType: { type: String, required: true }, // 'vibration', 'strain', 'water_flow', 'lux_meter', 'moisture', etc.
  city: { type: String, required: true },
  area: { type: String, required: true },
  readingValue: { type: Number, required: true },
  unit: { type: String, default: '' },
  thresholdStatus: { type: String, enum: ['Normal', 'Warning', 'Critical'], default: 'Normal' },
  anomalyScore: { type: Number, default: 20 }, // 0 to 100
  timestamp: { type: Date, default: Date.now }
});

const MongooseSensorData = mongoose.models.SensorData || mongoose.model('SensorData', sensorDataSchema);
export const SensorData = createDualModel(MongooseSensorData, 'sensorData');
export default SensorData;
