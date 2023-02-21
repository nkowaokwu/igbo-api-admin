import mongoose from 'mongoose';
import WordTags from '../shared/constants/WordTags';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import AnnotationSchema from './Annotation';

const { Schema } = mongoose;
export const corpusSchema = new Schema({
  title: { type: String, required: true },
  annotations: { type: [AnnotationSchema], default: [], required: true },
  // @deprecated - replaced with annotations
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

mongoose.model('Corpus', corpusSchema);
