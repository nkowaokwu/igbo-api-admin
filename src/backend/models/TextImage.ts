import mongoose from 'mongoose';
import { toObjectPlugin } from 'src/backend/models/plugins';

const { Schema, Types } = mongoose;

export const textImageSchema = new Schema(
  {
    media: { type: String, default: '', index: true },
    igbo: { type: String, default: '', index: true },
    english: { type: String, default: '', index: true },
    projectId: { type: Types.ObjectId, ref: 'Project', required: true },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

mongoose.model('TextImage', textImageSchema);
