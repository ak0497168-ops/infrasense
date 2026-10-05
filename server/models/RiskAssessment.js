import mongoose from 'mongoose';
import { createDualModel } from './modelFactory.js';

const riskAssessmentSchema = new mongoose.Schema({
  reportId: { type: String, required: true },
  riskScore: { type: Number, required: true }, // 0 to 100
  riskLevel: { 
    type: String, 
    required: true,
    enum: ['Low', 'Moderate', 'High', 'Critical']
  },
  maintenanceLikelihood: { type: Number, required: true }, // percentage 0 to 100
  riskFactors: {
    historicalMaintenance: {
      score: { type: Number, default: 0 },
      impact: { type: String, default: 'Moderate impact' },
      description: { type: String, default: '' }
    },
    publicComplaints: {
      score: { type: Number, default: 0 },
      impact: { type: String, default: 'Moderate impact' },
      count: { type: Number, default: 0 },
      description: { type: String, default: '' }
    },
    sensorData: {
      score: { type: Number, default: 0 },
      impact: { type: String, default: 'Moderate impact' },
      status: { type: String, default: 'Normal' },
      description: { type: String, default: '' }
    },
    climate: {
      score: { type: Number, default: 0 },
      impact: { type: String, default: 'Moderate impact' },
      description: { type: String, default: '' }
    },
    currentSeverity: {
      score: { type: Number, default: 0 },
      impact: { type: String, default: 'Moderate impact' },
      description: { type: String, default: '' }
    },
    infrastructureCondition: {
      score: { type: Number, default: 0 },
      impact: { type: String, default: 'Moderate impact' },
      description: { type: String, default: '' }
    }
  },
  explanation: { type: String, default: '' },
  similarComplaintsSummary: {
    count: { type: Number, default: 0 },
    windowDays: { type: Number, default: 30 },
    notes: { type: String, default: '' }
  },
  // Severity audit trail: tracks the source of severity used in risk calculation
  citizenSeverity: { type: String, default: null },       // citizen-entered severity (Step 3)
  aiEstimatedSeverity: { type: String, default: null },   // AI visual inspection severity (Step 4)
  effectiveSeverity: { type: String, default: null },     // severity that actually drove the risk score
  createdAt: { type: Date, default: Date.now }
});

const MongooseRiskAssessment = mongoose.models.RiskAssessment || mongoose.model('RiskAssessment', riskAssessmentSchema);
export const RiskAssessment = createDualModel(MongooseRiskAssessment, 'riskAssessments');
export default RiskAssessment;
