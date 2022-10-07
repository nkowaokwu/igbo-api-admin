import mongoose from 'mongoose';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import { toJSONPlugin, toObjectPlugin } from './plugins';

const { Schema, Types } = mongoose;
// @ts-ignore
const exampleSchema = new Schema({
  igbo: { type: String, default: '' },
  english: { type: String, default: '' },
  meaning: { type: String, default: '' },
  style: {
    type: String,
    enum: Object.values(ExampleStyle).map(({ value }) => value),
    default: ExampleStyle.NO_STYLE.value,
  },
  associatedWords: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  pronunciation: [{ type: String }],
}, { toObject: toObjectPlugin, timestamps: true });

toJSONPlugin(exampleSchema);

export default mongoose.model('Example', exampleSchema);
