import mongoose from 'mongoose';
import { every, has, partial } from 'lodash';
import Dialects from '../shared/constants/Dialects';
import { toJSONPlugin, toObjectPlugin, updatedOnHook } from './plugins';
import WordClass from '../shared/constants/WordClass';

const REQUIRED_DIALECT_KEYS = ['word', 'variations', 'dialect', 'pronunciation'];
const REQUIRED_DIALECT_CONSTANT_KEYS = ['code', 'value', 'label'];

const { Schema, Types } = mongoose;
const wordSchema = new Schema({
  word: { type: String, required: true },
  wordClass: { type: String, default: '', enum: Object.values(WordClass).map(({ value }) => value) },
  definitions: { type: [{ type: String }], default: [] },
  dialects: {
    type: Object,
    validate: (v) => {
      const dialectValues = Object.values(v);
      return dialectValues.every((dialectValue: { dialect: string }) => (
        every(REQUIRED_DIALECT_KEYS, partial(has, dialectValue))
        && every(REQUIRED_DIALECT_CONSTANT_KEYS, partial(has, Dialects[dialectValue.dialect]))
        && dialectValue.dialect === Dialects[dialectValue.dialect].value
      ));
    },
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
  updatedOn: { type: Date, default: Date.now() },
}, { toObject: toObjectPlugin, timestamps: true });

wordSchema.index({ word: 'text', variations: 'text' });

toJSONPlugin(wordSchema);
updatedOnHook(wordSchema);

const WordModel = mongoose.model('Word', wordSchema);
WordModel.syncIndexes();

export default WordModel;
