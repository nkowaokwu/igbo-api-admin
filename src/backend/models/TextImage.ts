import mongoose from 'mongoose';
import { toObjectPlugin } from 'src/backend/models/plugins';

const { Schema } = mongoose;

export const textImageSchema = new Schema(
  {
    objectId: { type: String, required: true, index: true },
    size: { type: Number, required: true },
    prevSize: { type: Number, default: -1 },
    transcription: { type: String, default: '', index: true },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

mongoose.model('TextImage', textImageSchema);
