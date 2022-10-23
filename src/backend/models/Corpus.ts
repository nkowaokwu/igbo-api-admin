import mongoose from 'mongoose';
import WordTags from '../shared/constants/WordTags';
import { toJSONPlugin, toObjectPlugin } from './plugins';

const { Schema } = mongoose;
const corpusSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  media: { type: String, required: true },
  duration: { type: Number, required: true },
  tags: {
    type: [{
      type: String,
      enum: Object.values(WordTags).map(({ value }) => value),
    }],
    default: [],
  },
}, { toObject: toObjectPlugin, timestamps: true });

toJSONPlugin(corpusSchema);

export default mongoose.model('Corpus', corpusSchema);
