import mongoose from 'mongoose';
import { createDualModel } from './modelFactory.js';

const feedbackSchema = new mongoose.Schema({
  reportId: { type: String, required: true },
  userId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseFeedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
export const Feedback = createDualModel(MongooseFeedback, 'feedbacks');
export default Feedback;
