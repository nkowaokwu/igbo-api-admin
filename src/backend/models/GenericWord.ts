import mongoose from 'mongoose';
import { every, has, partial } from 'lodash';
import Dialects from '../shared/constants/Dialects';
import { toJSONPlugin, toObjectPlugin } from './plugins/index';
import * as Interfaces from '../controllers/utils/interfaces';
import Tense from '../shared/constants/Tense';
import WordAttributes from '../shared/constants/WordAttributes';

const REQUIRED_DIALECT_KEYS = ['word', 'variations', 'dialect', 'pronunciation'];
const REQUIRED_DIALECT_CONSTANT_KEYS = ['code', 'value', 'label'];

const { Schema, Types } = mongoose;
const genericWordSchema = new Schema({
  word: { type: String, required: true },
  wordClass: { type: String, default: '' },
  definitions: {
    type: [{ type: String }],
    validate: (v) => Array.isArray(v) && v.length > 0,
  },
  dialects: {
    type: Object,
    validate: (v: { [key: string]: Interfaces.WordDialect }) => {
      const dialectValues = Object.values(v);
      return dialectValues.every((dialectValue) => (
        every(REQUIRED_DIALECT_KEYS, partial(has, dialectValue))
        && every(REQUIRED_DIALECT_CONSTANT_KEYS, partial(has, Dialects[dialectValue.dialect]))
        && dialectValue.dialect === Dialects[dialectValue.dialect].value
      ));
    },
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
  synonyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  antonyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  hypernyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  hyponyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  nsibidi: { type: String, default: '' },
  approvals: { type: [{ type: String }], default: [] },
  denials: { type: [{ type: String }], default: [] },
  merged: { type: Types.ObjectId, ref: 'Word', default: null },
  mergedBy: { type: String, default: null },
}, { toObject: toObjectPlugin, timestamps: true });

toJSONPlugin(genericWordSchema);

genericWordSchema.pre('findOneAndDelete', async function (next) {
  // @ts-ignore
  const genericWord = await this.model.findOne(this.getQuery());
  await mongoose.model('ExampleSuggestion')
    .deleteMany({ associatedWords: genericWord.id });
  // @ts-ignore
  next();
});

export default mongoose.model('GenericWord', genericWordSchema);
