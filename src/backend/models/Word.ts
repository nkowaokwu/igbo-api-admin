import mongoose from 'mongoose';
import { every } from 'lodash';
import Dialects from '../shared/constants/Dialect';
import { toJSONPlugin, toObjectPlugin } from './plugins';
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
  nsibidiCharacters: { type: [{ type: Types.ObjectId, ref: 'NsibidiCharacter' }], default: [] },
  igboDefinitions: {
    type: [{
      igbo: String,
      nsibidi: String,
      nsibidiCharacters: { type: [{ type: Types.ObjectId, ref: 'NsibidiCharacter' }], default: [] },
    }],
    default: [],
  },
}, { toObject: toObjectPlugin });

const dialectSchema = new Schema({
  word: { type: String, required: true },
  variations: { type: [{ type: String }], default: [] },
  dialects: { type: [{ type: String }], validate: (v) => every(v, (dialect) => Dialects[dialect].value), default: [] },
  pronunciation: { type: String, default: '' },
}, { toObject: toObjectPlugin });

export const wordSchema = new Schema({
  word: { type: String, required: true },
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
  frequency: { type: Number, default: 1 },
  stems: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  relatedTerms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  hypernyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  hyponyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
}, { toObject: toObjectPlugin, timestamps: true });

toJSONPlugin(wordSchema);
toJSONPlugin(definitionSchema);

wordSchema.index({
  merged: 1,
  updatedAt: -1,
}, {
  name: 'Descending word index',
});

wordSchema.index({
  merged: 1,
  updatedAt: 1,
}, {
  name: 'Descending word index',
});

mongoose.model('Word', wordSchema);
