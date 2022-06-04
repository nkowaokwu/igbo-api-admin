import mongoose from 'mongoose';
import { toJSONPlugin, toObjectPlugin } from './plugins';

const { Schema } = mongoose;
const courseSchema = new Schema({
  body: { type: String, required: true },
  audio: { type: Buffer },
  author: { type: String, required: true },
}, { toObject: toObjectPlugin, timestamps: true });

toJSONPlugin(courseSchema);

export default mongoose.model('Developer', courseSchema);
