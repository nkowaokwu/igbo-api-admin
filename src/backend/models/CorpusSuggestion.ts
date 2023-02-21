import mongoose from 'mongoose';
import WordTags from '../shared/constants/WordTags';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import AnnotationSchema from './Annotation';

const { Schema, Types } = mongoose;
export const corpusSuggestionSchema = new Schema({
  originalCorpusId: { type: Types.ObjectId, ref: 'Corpus', default: null },
  title: { type: String, required: true },
  annotations: { type: [AnnotationSchema], default: [], required: true },
  // @deprecated - replaced with annotations
  body: { type: String, required: true },
  media: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  tags: {
    type: [{
      type: String,
      enum: Object.values(WordTags).map(({ value }) => value),
    }],
    default: [],
  },
  editorsNotes: { type: String, default: '' },
  authorEmail: { type: String, default: '' },
  authorId: { type: String, default: '' },
  approvals: { type: [{ type: String }], default: [] },
  denials: { type: [{ type: String }], default: [] },
  merged: { type: Types.ObjectId, ref: 'Corpus', default: null },
  mergedBy: { type: String, default: null },
  userInteractions: { type: [{ type: String }], default: [] },
}, { toObject: toObjectPlugin, timestamps: true });

toJSONPlugin(corpusSuggestionSchema);

mongoose.model('CorpusSuggestion', corpusSuggestionSchema);
