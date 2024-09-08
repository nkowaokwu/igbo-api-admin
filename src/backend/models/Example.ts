import mongoose from 'mongoose';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import { toJSONPlugin, toObjectPlugin } from './plugins';

const { Schema, Types } = mongoose;

const audioPronunciationSchema = new Schema(
  {
    audio: { type: String, default: '' },
    speaker: { type: String, default: '' },
    archived: { type: Boolean, default: false },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

const translationSchema = new Schema({
  language: { type: String, enum: Object.values(LanguageEnum), default: LanguageEnum.UNSPECIFIED },
  text: { type: String, default: '', trim: true },
});

export const exampleSchema = new Schema(
  {
    source: { type: translationSchema, default: { language: LanguageEnum.UNSPECIFIED, text: '' } },
    translations: { type: [{ type: translationSchema }], default: [] },
    meaning: { type: String, default: '', trim: true },
    nsibidi: { type: String, default: '' },
    nsibidiCharacters: { type: [{ type: Types.ObjectId, ref: 'NsibidiCharacter' }], default: [] },
    type: {
      type: String,
      enum: Object.values(SentenceTypeEnum),
      default: SentenceTypeEnum.DEFAULT,
    },
    style: {
      type: String,
      enum: Object.values(ExampleStyleEnum),
      default: ExampleStyleEnum.NO_STYLE,
    },
    associatedWords: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    associatedDefinitionsSchemas: { type: [{ type: Types.ObjectId }], default: [] },
    pronunciations: {
      type: [{ type: audioPronunciationSchema }],
      default: [],
    },
    archived: { type: Boolean, default: false },
    origin: { type: String, default: SuggestionSourceEnum.INTERNAL },
    projectId: { type: Types.ObjectId, ref: 'Project', required: true },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(exampleSchema);

mongoose.model('Example', exampleSchema);
