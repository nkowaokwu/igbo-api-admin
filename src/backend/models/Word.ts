import mongoose from 'mongoose';
import { every, has, partial } from 'lodash';
import Dialects from '../shared/constants/Dialects';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import Tense from '../shared/constants/Tense';
import WordClass from '../shared/constants/WordClass';
import WordAttributes from '../shared/constants/WordAttributes';
import WordTags from '../shared/constants/WordTags';
import * as Interfaces from '../controllers/utils/interfaces';

const REQUIRED_DIALECT_KEYS = ['variations', 'dialects', 'pronunciation'];
const REQUIRED_DIALECT_CONSTANT_KEYS = ['code', 'value', 'label'];

const { Schema, Types } = mongoose;

const definitionSchema = new Schema({
  wordClass: {
    type: String,
    default: WordClass.NNC.value,
    enum: Object.values(WordClass).map(({ value }) => value),
  },
  label: { type: String, default: '', trim: true },
  definitions: { type: [{ type: String }], default: [] },
}, { toObject: toObjectPlugin });

const wordSchema = new Schema({
  word: { type: String, required: true },
  definitions: [{
    type: definitionSchema,
    validate: (definitions) => (
      Array.isArray(definitions)
      && definitions.length > 0
    ),
  }],
  dialects: {
    type: Object,
    validate: (v) => {
      const dialectValues = Object.values(v) as Interfaces.WordDialect[];
      return dialectValues.every((dialectValue) => (
        every(REQUIRED_DIALECT_KEYS, partial(has, dialectValue))
        && every(dialectValue.dialects, (dialect) => (
          every(REQUIRED_DIALECT_CONSTANT_KEYS, partial(has, Dialects[dialect]))
        ))
        && Array.isArray(dialectValue.dialects)
        && every(dialectValue.dialects, (dialect) => Dialects[dialect].value)
        && typeof dialectValue.pronunciation === 'string'
        && Array.isArray(dialectValue.variations)
      ));
    },
    required: false,
    default: {},
  },
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
  frequency: { type: Number },
  stems: { type: [{ type: String }], default: [] },
  relatedTerms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  hypernyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  hyponyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  nsibidi: { type: String, default: '' },
}, { toObject: toObjectPlugin, timestamps: true });

toJSONPlugin(wordSchema);
toJSONPlugin(definitionSchema);

const WordModel = mongoose.model('Word', wordSchema);
WordModel.syncIndexes();

export default WordModel;
