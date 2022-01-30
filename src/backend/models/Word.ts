import mongoose from 'mongoose';
import { every, has, partial } from 'lodash';
import Dialects from '../shared/constants/Dialects';
import { toJSONPlugin, toObjectPlugin, updatedOnHook } from './plugins';
import WordClass from '../shared/constants/WordClass';
import * as Interfaces from '../controllers/utils/interfaces';

const REQUIRED_DIALECT_KEYS = ['variations', 'dialects', 'pronunciation'];
const REQUIRED_DIALECT_CONSTANT_KEYS = ['code', 'value', 'label'];

const { Schema, Types } = mongoose;
const wordSchema = new Schema({
  word: { type: String, required: true },
  wordClass: { type: String, default: '', enum: Object.values(WordClass).map(({ value }) => value) },
  definitions: { type: [{ type: String }], default: [] },
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
  pronunciation: { type: String, default: '' },
  isStandardIgbo: { type: Boolean, default: false },
  variations: { type: [{ type: String }], default: [] },
  frequency: { type: Number },
  stems: { type: [{ type: String }], default: [] },
  synonyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  antonyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  hypernyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  hyponyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  isComplete: { type: Boolean, default: false },
  nsibidi: { type: String, default: '' },
  updatedOn: { type: Date, default: Date.now() },
}, { toObject: toObjectPlugin, timestamps: true });

wordSchema.index({ word: 'text', variations: 'text', nsibidi: 'text' });

toJSONPlugin(wordSchema);
updatedOnHook(wordSchema);

const WordModel = mongoose.model('Word', wordSchema);
WordModel.syncIndexes();

export default WordModel;
