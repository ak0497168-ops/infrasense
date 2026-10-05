import mongoose from 'mongoose';
import { createDualModel } from './modelFactory.js';

const infrastructureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Roads', 'Bridges', 'Streetlights', 'Water Pipelines', 'Public Buildings', 'Drainage']
  },
  city: { type: String, required: true },
  area: { type: String, required: true },
  conditionRating: { type: Number, default: 70 }, // 0 to 100
  installationYear: { type: Number, default: 2018 },
  lastInspectedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'Operational' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseInfrastructure = mongoose.models.Infrastructure || mongoose.model('Infrastructure', infrastructureSchema);
export const Infrastructure = createDualModel(MongooseInfrastructure, 'infrastructures');
export default Infrastructure;
