import mongoose from 'mongoose';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import { every } from 'lodash';
import Dialects from '../shared/constants/Dialect';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import Tense from '../shared/constants/Tense';
import WordClass from '../shared/constants/WordClass';
import WordAttributes from '../shared/constants/WordAttributes';
import WordTags from '../shared/constants/WordTags';

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
  },
  { toObject: toObjectPlugin },
);

export const wordSchema = new Schema(
  {
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
      validate: (v) =>
        v.every((tag) =>
          Object.values(WordTags)
            .map(({ value }) => value)
            .includes(tag),
        ),
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
    frequency: { type: Number, default: 1 },
    stems: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    relatedTerms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    hypernyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    hyponyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(wordSchema);
toJSONPlugin(definitionSchema);

wordSchema.index(
  {
    merged: 1,
    updatedAt: -1,
  },
  {
    name: 'Descending word index',
  },
);

wordSchema.index(
  {
    merged: 1,
    updatedAt: 1,
  },
  {
    name: 'Descending word index',
  },
);

mongoose.model('Word', wordSchema);
