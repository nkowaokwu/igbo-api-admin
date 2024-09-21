import mongoose from 'mongoose';
import WordTagEnum from '../shared/constants/WordTagEnum';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import AnnotationSchema from './Annotation';

const { Schema, Types } = mongoose;
export const corpusSuggestionSchema = new Schema(
  {
    originalCorpusId: { type: Types.ObjectId, ref: 'Corpus', default: null },
    title: { type: String, required: true },
    annotations: { type: [AnnotationSchema], default: [], required: true },
    // @deprecated - replaced with annotations
    body: { type: String, required: true },
    media: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    tags: {
      type: [String],
      default: [],
      validate: (v) => v.every((tag) => Object.values(WordTagEnum).includes(tag)),
    },
    editorsNotes: { type: String, default: '' },
    authorEmail: { type: String, default: '' },
    authorId: { type: String, default: '' },
    approvals: { type: [{ type: String }], default: [] },
    denials: { type: [{ type: String }], default: [] },
    merged: { type: Types.ObjectId, ref: 'Corpus', default: null },
    mergedBy: { type: String, default: null },
    userInteractions: { type: [{ type: String }], default: [] },
    projectId: { type: Types.ObjectId, ref: 'Project', required: true },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(corpusSuggestionSchema);

mongoose.model('CorpusSuggestion', corpusSuggestionSchema);
