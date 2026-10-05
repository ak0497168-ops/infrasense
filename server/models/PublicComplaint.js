import mongoose from 'mongoose';
import { createDualModel } from './modelFactory.js';

const publicComplaintSchema = new mongoose.Schema({
  infrastructureType: { type: String, required: true },
  problemType: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  street: { type: String, default: '' },
  reportedAt: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  urgency: { type: String, default: 'Moderate' },
  createdAt: { type: Date, default: Date.now }
});

const MongoosePublicComplaint = mongoose.models.PublicComplaint || mongoose.model('PublicComplaint', publicComplaintSchema);
export const PublicComplaint = createDualModel(MongoosePublicComplaint, 'publicComplaints');
export default PublicComplaint;
