import mongoose from 'mongoose';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import { toJSONPlugin, toObjectPlugin } from './plugins/index';
import { uploadExamplePronunciation } from './plugins/examplePronunciationHook';
import { normalizeIgbo } from './plugins/normalizationHooks';
import CrowdsourcingType from '../shared/constants/CrowdsourcingType';

const { Schema, Types } = mongoose;

const audioPronunciationSuggestionSchema = new Schema(
  {
    audio: { type: String, default: '' },
    speaker: { type: String, default: '' },
    archived: { type: Boolean, default: false },
    review: { type: Boolean, default: true },
    approvals: { type: [{ type: String }], default: [] },
    denials: { type: [{ type: String }], default: [] },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

const translationSchema = new Schema(
  {
    language: { type: String, enum: Object.values(LanguageEnum), default: LanguageEnum.UNSPECIFIED },
    text: { type: String, default: '', trim: true },
    pronunciations: {
      type: [{ type: audioPronunciationSuggestionSchema }],
      default: [],
    },
    approvals: { type: [{ type: String }], default: [] },
    authorId: { type: String, default: '' },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

export const exampleSuggestionSchema = new Schema(
  {
    originalExampleId: {
      type: Types.ObjectId,
      ref: 'Example',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(SentenceTypeEnum),
      default: SentenceTypeEnum.DEFAULT,
    },
    source: { type: translationSchema, default: { language: LanguageEnum.UNSPECIFIED, text: '' } },
    translations: { type: [{ type: translationSchema }], default: [] },
    meaning: { type: String, default: '', trim: true },
    nsibidi: { type: String, default: '' },
    nsibidiCharacters: { type: [{ type: Types.ObjectId, ref: 'NsibidiCharacter' }], default: [] },
    style: {
      type: String,
      enum: Object.values(ExampleStyleEnum),
      default: ExampleStyleEnum.NO_STYLE,
    },
    associatedWords: { type: [{ type: Types.ObjectId }], default: [], index: true },
    associatedDefinitionsSchemas: { type: [{ type: Types.ObjectId }], default: [] },
    exampleForSuggestion: { type: Boolean, default: false },
    editorsNotes: { type: String, default: '' },
    userComments: { type: String, default: '' },
    authorEmail: { type: String, default: '' },
    authorId: { type: String, default: '' },
    approvals: { type: [{ type: String }], default: [] },
    denials: { type: [{ type: String }], default: [] },
    origin: { type: String, default: SuggestionSourceEnum.INTERNAL },
    merged: { type: Types.ObjectId, ref: 'Example', default: null },
    mergedBy: { type: String, default: null },
    userInteractions: { type: [{ type: String }], default: [] },
    crowdsourcing: {
      type: Object,
      validate: (v) => {
        const crowdsourcingKeys = Object.keys(CrowdsourcingType);
        return Object.entries(v).map(([key, value]) => crowdsourcingKeys.includes(key) && typeof value === 'boolean');
      },
      required: false,
      default: Object.keys(CrowdsourcingType).reduce(
        (finalCrowdsourcing, key) => ({
          ...finalCrowdsourcing,
          [key]: false,
        }),
        {},
      ),
    },
    projectId: { type: Types.ObjectId, ref: 'Project', required: true },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(exampleSuggestionSchema);
uploadExamplePronunciation(exampleSuggestionSchema);
normalizeIgbo(exampleSuggestionSchema);

exampleSuggestionSchema.index({
  authorId: 1,
  mergedBy: 1,
  updatedAt: -1,
});

mongoose.model('ExampleSuggestion', exampleSuggestionSchema);
