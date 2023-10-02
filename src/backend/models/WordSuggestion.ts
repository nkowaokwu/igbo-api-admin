/* eslint-disable prefer-arrow-callback */
import mongoose from 'mongoose';
import { every } from 'lodash';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import Dialects from '../shared/constants/Dialect';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import { uploadWordPronunciation } from './plugins/wordPronunciationHook';
import { normalizeHeadword } from './plugins/normalizationHooks';
import Tense from '../shared/constants/Tense';
import WordClass from '../shared/constants/WordClass';
import WordAttributes from '../shared/constants/WordAttributes';
import WordTagEnum from '../shared/constants/WordTagEnum';
import CrowdsourcingType from '../shared/constants/CrowdsourcingType';

const { Schema, Types } = mongoose;

const definitionSchema = new Schema(
  {
    wordClass: {
      type: String,
      default: WordClassEnum.NNC,
      enum: Object.values(WordClass).map(({ value }) => value),
    },
    label: { type: String, default: '', trim: true },
    definitions: { type: [{ type: String }], default: [] },
    nsibidi: { type: String, default: '', index: true },
    nsibidiCharacters: { type: [{ type: Types.ObjectId, ref: 'NsibidiCharacter' }], default: [] },
    igboDefinitions: {
      type: [
        {
          igbo: String,
          nsibidi: String,
          nsibidiCharacters: { type: [{ type: Types.ObjectId, ref: 'NsibidiCharacter' }], default: [] },
        },
      ],
      default: [],
      index: true,
    },
  },
  { toObject: toObjectPlugin },
);

const dialectSchema = new Schema(
  {
    word: { type: String, required: true, trim: true },
    variations: { type: [{ type: String }], default: [] },
    dialects: {
      type: [{ type: String }],
      validate: (v) => every(v, (dialect) => Dialects[dialect].value),
      default: [],
    },
    pronunciation: { type: String, default: '' },
    editor: { type: String, default: null },
  },
  { toObject: toObjectPlugin },
);

export const wordSuggestionSchema = new Schema(
  {
    originalWordId: { type: Types.ObjectId, ref: 'Word', default: null, index: true },
    word: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    wordPronunciation: { type: String, default: '', trim: true },
    conceptualWord: { type: String, default: '', trim: true },
    definitions: [
      {
        type: definitionSchema,
        validate: (definitions) => Array.isArray(definitions) && definitions.length > 0,
      },
    ],
    dialects: { type: [dialectSchema], default: [] },
    tags: {
      type: [String],
      default: [],
      validate: (v) => v.every((tag) => Object.values(WordTagEnum).includes(tag)),
    },
    tenses: Object.values(Tense).reduce(
      (tenses, { value }) => ({
        ...tenses,
        [value]: { type: String, default: '', trim: true },
      }),
      {},
    ),
    pronunciation: { type: String, default: '' },
    attributes: Object.values(WordAttributes).reduce(
      (finalAttributes, { value }) => ({
        ...finalAttributes,
        [value]: { type: Boolean, default: false },
      }),
      {},
    ),
    variations: { type: [{ type: String }], default: [] },
    editorsNotes: { type: String, default: '' },
    userComments: { type: String, default: '' },
    authorEmail: { type: String, default: '' },
    authorId: {
      type: String,
      default: '',
      index: true,
      immutable: true,
    },
    stems: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    relatedTerms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    hypernyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    hyponyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    approvals: { type: [{ type: String }], default: [] },
    denials: { type: [{ type: String }], default: [] },
    source: { type: String },
    merged: { type: Types.ObjectId, ref: 'Word', default: null },
    mergedBy: { type: String, default: null },
    userInteractions: { type: [{ type: String }], default: [] },
    frequency: { type: Number, default: 1 },
    twitterPollId: { type: String, default: '' },
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

toJSONPlugin(wordSuggestionSchema);
uploadWordPronunciation(wordSuggestionSchema);
normalizeHeadword(wordSuggestionSchema);
toJSONPlugin(definitionSchema);

wordSuggestionSchema.index(
  {
    merged: 1,
    updatedAt: -1,
  },
  {
    name: 'Descending word suggestion index',
  },
);

wordSuggestionSchema.index({
  mergedBy: 1,
  'dialects.editor': 1,
  updatedAt: -1,
});

mongoose.model('WordSuggestion', wordSuggestionSchema);
