import mongoose from 'mongoose';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import SuggestionSource from 'src/backend/shared/constants/SuggestionSource';
import SentenceType from 'src/backend/shared/constants/SentenceType';
import { toJSONPlugin, toObjectPlugin } from './plugins/index';
import { uploadExamplePronunciation } from './plugins/examplePronunciationHook';
import { normalizeIgbo } from './plugins/normalizationHooks';
import CrowdsourcingType from '../shared/constants/CrowdsourcingType';

const { Schema, Types } = mongoose;

const audioPronunciationSuggestionSchema = new Schema(
  {
    audio: { type: String, default: '' },
    speaker: { type: String, default: '' },
    review: { type: Boolean, default: true },
    approvals: { type: [{ type: String }], default: [] },
    denials: { type: [{ type: String }], default: [] },
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
      enum: Object.values(SentenceType),
      default: SentenceType.DEFAULT,
    },
    igbo: { type: String, default: '', trim: true },
    english: { type: String, default: '', trim: true },
    meaning: { type: String, default: '', trim: true },
    nsibidi: { type: String, default: '' },
    nsibidiCharacters: { type: [{ type: Types.ObjectId, ref: 'NsibidiCharacter' }], default: [] },
    style: {
      type: String,
      enum: Object.values(ExampleStyle).map(({ value }) => value),
      default: ExampleStyle.NO_STYLE.value,
    },
    associatedWords: { type: [{ type: Types.ObjectId }], default: [], index: true },
    associatedDefinitionsSchemas: { type: [{ type: Types.ObjectId }], default: [] },
    pronunciations: {
      type: [{ type: audioPronunciationSuggestionSchema }],
      default: [],
    },
    exampleForSuggestion: { type: Boolean, default: false },
    editorsNotes: { type: String, default: '' },
    userComments: { type: String, default: '' },
    authorEmail: { type: String, default: '' },
    authorId: { type: String, default: '' },
    approvals: { type: [{ type: String }], default: [] },
    denials: { type: [{ type: String }], default: [] },
    source: { type: String, default: SuggestionSource.INTERNAL },
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
