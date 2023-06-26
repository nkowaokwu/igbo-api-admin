import mongoose from 'mongoose';
import { toObjectPlugin } from 'src/backend/models/plugins';

const { Schema } = mongoose;

export const audioPronunciationSchema = new Schema(
  {
    objectId: { type: String, required: true, index: true },
    size: { type: Number, required: true },
    prevSize: { type: Number, default: -1 },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

mongoose.model('AudioPronunciation', audioPronunciationSchema);
