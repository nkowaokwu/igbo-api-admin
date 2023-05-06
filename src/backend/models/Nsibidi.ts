import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins';

const { Schema } = mongoose;

export const nsibidiSchema = new Schema({
  nsibidi: { type: String, required: true, index: true },
  definitions: { type: [{ text: String }], default: [] },
  pronunciations: { type: [{ text: String }], default: [] },
});

toJSONPlugin(nsibidiSchema);

mongoose.model('Nsibidi', nsibidiSchema);
