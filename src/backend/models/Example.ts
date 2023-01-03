import mongoose from 'mongoose';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import { toJSONPlugin, toObjectPlugin } from './plugins';

const { Schema, Types } = mongoose;
export const exampleSchema = new Schema({
  igbo: { type: String, default: '' },
  english: { type: String, default: '' },
  meaning: { type: String, default: '' },
  nsibidi: { type: String, default: '' },
  style: {
    type: String,
    enum: Object.values(ExampleStyle).map(({ value }) => value),
    default: ExampleStyle.NO_STYLE.value,
  },
  associatedWords: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  associatedDefinitionsSchemas: { type: [{ type: Types.ObjectId }], default: [] },
  pronunciation: { type: String, default: '' },
  archived: { type: Boolean, default: false },
}, { toObject: toObjectPlugin, timestamps: true });

toJSONPlugin(exampleSchema);

mongoose.model('Example', exampleSchema);
