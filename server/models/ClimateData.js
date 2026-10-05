import mongoose from 'mongoose';
import { createDualModel } from './modelFactory.js';

const climateDataSchema = new mongoose.Schema({
  city: { type: String, required: true },
  area: { type: String, required: true },
  temperature: { type: Number, default: 29 }, // in Celsius
  rainfallMm: { type: Number, default: 45 },
  humidity: { type: Number, default: 72 },
  floodRiskIndex: { type: Number, default: 35 }, // 0 to 100
  environmentalRiskRating: { type: String, default: 'Moderate' }, // Low, Moderate, High
  recordedAt: { type: Date, default: Date.now }
});

const MongooseClimateData = mongoose.models.ClimateData || mongoose.model('ClimateData', climateDataSchema);
export const ClimateData = createDualModel(MongooseClimateData, 'climateData');
export default ClimateData;
