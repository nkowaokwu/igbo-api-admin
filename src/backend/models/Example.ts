import mongoose from 'mongoose';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import { toJSONPlugin, toObjectPlugin } from './plugins';

const { Schema, Types } = mongoose;
export const exampleSchema = new Schema({
  igbo: { type: String, default: '', trim: true },
  english: { type: String, default: '', trim: true },
  meaning: { type: String, default: '', trim: true },
  nsibidi: { type: String, default: '' },
  style: {
    type: String,
    enum: Object.values(ExampleStyle).map(({ value }) => value),
    default: ExampleStyle.NO_STYLE.value,
  },
  associatedWords: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  associatedDefinitionsSchemas: { type: [{ type: Types.ObjectId }], default: [] },
  pronunciations: {
    type: [{
      audio: { type: String, default: '' },
      speaker: { type: String, default: '' },
    }],
    default: [],
  },
  archived: { type: Boolean, default: false },
}, { toObject: toObjectPlugin, timestamps: true });

toJSONPlugin(exampleSchema);

mongoose.model('Example', exampleSchema);
