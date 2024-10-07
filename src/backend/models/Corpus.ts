import mongoose from 'mongoose';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import WordTags from 'src/backend/shared/constants/WordTags';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import AnnotationSchema from './Annotation';

const { Schema, Types } = mongoose;
export const corpusSchema = new Schema(
  {
    title: { type: String, required: true },
    annotations: { type: [AnnotationSchema], default: [], required: true },
    // @deprecated - replaced with annotations
    body: { type: String, required: true },
    media: { type: String, required: true },
    duration: { type: Number, required: true },
    tags: {
      type: [
        {
          type: String,
          enum: Object.values(WordTags).map(({ value }) => value),
        },
      ],
      default: [],
    },
    languages: { types: [{ type: String, enum: Object.values(LanguageEnum) }], default: [] },
    projectId: { type: Types.ObjectId, ref: 'Project', required: true },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(corpusSchema);

mongoose.model('Corpus', corpusSchema);
