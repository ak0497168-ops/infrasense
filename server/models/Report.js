import mongoose from 'mongoose';
import { createDualModel } from './modelFactory.js';

const reportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  infrastructureType: { 
    type: String, 
    required: true,
    enum: ['Roads', 'Bridges', 'Streetlights', 'Water Pipelines', 'Public Buildings', 'Drainage']
  },
  problemType: { type: String, required: true },
  severity: { 
    type: String, 
    required: true,
    enum: ['Low', 'Moderate', 'High', 'Critical']
  },
  description: { type: String, required: true },
  location: {
    city: { type: String, required: true },
    area: { type: String, required: true },
    street: { type: String, required: true },
    landmark: { type: String, default: '' }
  },
  evidence: {
    images: [{ type: String }],
    videos: [{ type: String }]
  },
  aiImageAnalysis: {
    detectedIssue: { type: String },
    confidence: { type: Number },
    estimatedSeverity: { type: String },
    visualCues: [{ type: String }]
  },
  status: {
    type: String,
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'MAINTENANCE_SCHEDULED', 'IN_PROGRESS', 'RESOLVED'],
    default: 'SUBMITTED'
  },
  statusHistory: [{
    status: { type: String },
    adminName: { type: String, default: 'System' },
    adminId: { type: String },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' }
  }],
  internalNotes: [{
    adminName: { type: String },
    adminId: { type: String },
    note: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  maintenanceSchedule: {
    scheduledDate: { type: Date },
    assignedCrew: { type: String },
    estimatedDuration: { type: String },
    notes: { type: String }
  },
  resolutionDetails: {
    resolvedAt: { type: Date },
    resolvedBy: { type: String },
    resolutionNotes: { type: String },
    actionsTaken: [{ type: String }]
  },
  riskAssessmentId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongooseReport = mongoose.models.Report || mongoose.model('Report', reportSchema);
export const Report = createDualModel(MongooseReport, 'reports');
export default Report;
