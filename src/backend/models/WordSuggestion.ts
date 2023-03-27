/* eslint-disable prefer-arrow-callback */
import mongoose from 'mongoose';
import { every } from 'lodash';
import Dialects from '../shared/constants/Dialects';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import { uploadWordPronunciation } from './plugins/pronunciationHooks';
import { normalizeHeadword } from './plugins/normalizationHooks';
import Tense from '../shared/constants/Tense';
import WordClass from '../shared/constants/WordClass';
import WordAttributes from '../shared/constants/WordAttributes';
import WordTags from '../shared/constants/WordTags';

const { Schema, Types } = mongoose;

const definitionSchema = new Schema({
  wordClass: {
    type: String,
    default: WordClass.NNC.value,
    enum: Object.values(WordClass).map(({ value }) => value),
  },
  label: { type: String, default: '', trim: true },
  definitions: { type: [{ type: String }], default: [] },
  nsibidi: { type: String, default: '', index: true },
  igboDefinitions: { type: [{ type: String }], default: [] },
}, { toObject: toObjectPlugin });

const dialectSchema = new Schema({
  word: { type: String, required: true },
  variations: { type: [{ type: String }], default: [] },
  dialects: { type: [{ type: String }], validate: (v) => every(v, (dialect) => Dialects[dialect].value), default: [] },
  pronunciation: { type: String, default: '' },
  editor: { type: String, default: null },
}, { toObject: toObjectPlugin });

export const wordSuggestionSchema = new Schema(
  {
    originalWordId: { type: Types.ObjectId, ref: 'Word', default: null },
    word: { type: String, required: true, index: true },
    wordPronunciation: { type: String, default: '' },
    conceptualWord: { type: String, default: '' },
    definitions: [{
      type: definitionSchema,
      validate: (definitions) => (
        Array.isArray(definitions)
        && definitions.length > 0
      ),
    }],
    dialects: { type: [dialectSchema], default: [] },
    tags: {
      type: [String],
      default: [],
      validate: (v) => (
        v.every((tag) => Object.values(WordTags).map(({ value }) => value).includes(tag))
      ),
    },
    tenses: {
      type: Object,
      validate: (v) => {
        const tenseValues = Object.values(Tense);
        Object.keys(v).every((key) => (
          tenseValues.find(({ value: tenseValue }) => key === tenseValue)
        ));
      },
      required: false,
      default: {},
    },
    pronunciation: { type: String, default: '' },
    attributes: Object.entries(WordAttributes)
      .reduce((finalAttributes, [, { value }]) => ({
        ...finalAttributes,
        [value]: { type: Boolean, default: false },
      }), {}),
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
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(wordSuggestionSchema);
uploadWordPronunciation(wordSuggestionSchema);
normalizeHeadword(wordSuggestionSchema);
toJSONPlugin(definitionSchema);

wordSuggestionSchema.index({
  merged: 1,
  updatedAt: -1,
}, {
  name: 'Descending word suggestion index',
});

wordSuggestionSchema.index({
  mergedBy: 1,
  'dialects.editor': 1,
  updatedAt: -1,
}, {
  name: 'Merged word suggestion index',
});

mongoose.model('WordSuggestion', wordSuggestionSchema);
