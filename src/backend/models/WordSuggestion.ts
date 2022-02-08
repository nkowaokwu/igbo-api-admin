/* eslint-disable prefer-arrow-callback */
import mongoose from 'mongoose';
import { every, has, partial } from 'lodash';
import Dialects from '../shared/constants/Dialects';
import { toJSONPlugin, toObjectPlugin, updatedOnHook } from './plugins';
import { uploadWordPronunciation } from './plugins/pronunciationHooks';
import * as Interfaces from '../controllers/utils/interfaces';
import WordClass from '../shared/constants/WordClass';

const REQUIRED_DIALECT_KEYS = ['variations', 'dialects', 'pronunciation'];
const REQUIRED_DIALECT_CONSTANT_KEYS = ['code', 'value', 'label'];

const { Schema, Types } = mongoose;
const wordSuggestionSchema = new Schema(
  {
    originalWordId: { type: Types.ObjectId, ref: 'Word', default: null },
    word: { type: String, required: true },
    wordClass: { type: String, required: true, enum: Object.values(WordClass).map(({ value }) => value) },
    definitions: {
      type: [{ type: String }],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
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
    editorsNotes: { type: String, default: '' },
    userComments: { type: String, default: '' },
    authorEmail: { type: String, default: '' },
    authorId: { type: String, default: '' },
    stems: { type: [{ type: String }], default: [] },
    synonyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    antonyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    hypernyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    hyponyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    nsibidi: { type: String, default: '' },
    approvals: { type: [{ type: String }], default: [] },
    denials: { type: [{ type: String }], default: [] },
    isComplete: { type: Boolean, default: false },
    updatedOn: { type: Date, default: Date.now() },
    merged: { type: Types.ObjectId, ref: 'Word', default: null },
    mergedBy: { type: String, default: null },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(wordSuggestionSchema);
updatedOnHook(wordSuggestionSchema);
uploadWordPronunciation(wordSuggestionSchema);

wordSuggestionSchema.pre('findOneAndDelete', async function (next) {
  const wordSuggestionId = this.getQuery()._id;
  await mongoose
    .model('ExampleSuggestion')
    .deleteMany({ associatedWords: wordSuggestionId });
  // @ts-ignore
  next();
});

export default mongoose.model('WordSuggestion', wordSuggestionSchema);
