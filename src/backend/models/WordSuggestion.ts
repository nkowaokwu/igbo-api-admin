/* eslint-disable prefer-arrow-callback */
import mongoose from 'mongoose';
import { every, has, partial } from 'lodash';
import Dialects from '../shared/constants/Dialects';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import { uploadWordPronunciation } from './plugins/pronunciationHooks';
import * as Interfaces from '../controllers/utils/interfaces';
import Tense from '../shared/constants/Tense';
import WordClass from '../shared/constants/WordClass';
import WordAttributes from '../shared/constants/WordAttributes';
import WordTags from '../shared/constants/WordTags';
import SuggestionSource from '../shared/constants/SuggestionSource';

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
    authorId: { type: String, default: '' },
    stems: { type: [{ type: String }], default: [] },
    relatedTerms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    hypernyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    hyponyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    nsibidi: { type: String, default: '' },
    approvals: { type: [{ type: String }], default: [] },
    denials: { type: [{ type: String }], default: [] },
    source: { type: String, defualt: SuggestionSource.INTERNAL },
    merged: { type: Types.ObjectId, ref: 'Word', default: null },
    mergedBy: { type: String, default: null },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(wordSuggestionSchema);
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
