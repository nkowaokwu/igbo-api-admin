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
import SuggestionSource from '../shared/constants/SuggestionSource';

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

const dialectSchema = new Schema({
  word: { type: String, required: true },
  variations: { type: [{ type: String }], default: [] },
  dialects: { type: [{ type: String }], validate: (v) => every(v, (dialect) => Dialects[dialect].value), default: [] },
  pronunciation: { type: String, default: '' },
}, { toObject: toObjectPlugin });

const wordSuggestionSchema = new Schema(
  {
    originalWordId: { type: Types.ObjectId, ref: 'Word', default: null },
    word: { type: String, required: true },
    definitions: [{
      type: definitionSchema,
      validate: (definitions) => (
        Array.isArray(definitions)
        && definitions.length > 0
      ),
    }],
    dialects: { type: [dialectSchema] },
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
    userInteractions: { type: [{ type: String }], default: [] },
    twitterPollId: { type: String, default: '' },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(wordSuggestionSchema);
uploadWordPronunciation(wordSuggestionSchema);
normalizeHeadword(wordSuggestionSchema);
toJSONPlugin(definitionSchema);

wordSuggestionSchema.pre('findOneAndDelete', async function (next) {
  const wordSuggestionId = this.getQuery()._id;
  await mongoose
    .model('ExampleSuggestion')
    .deleteMany({ associatedWords: wordSuggestionId });
  // @ts-ignore
  next();
});

export default mongoose.model('WordSuggestion', wordSuggestionSchema);
