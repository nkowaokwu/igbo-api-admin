import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins';

const { Schema } = mongoose;

export const nsibidiCharacterSchema = new Schema({
  nsibidi: { type: String, required: true, index: true },
  definitions: { type: [{ text: String }], default: [] },
  pronunciations: { type: [{ text: String }], default: [] },
});

toJSONPlugin(nsibidiCharacterSchema);

mongoose.model('NsibidiCharacter', nsibidiCharacterSchema);
