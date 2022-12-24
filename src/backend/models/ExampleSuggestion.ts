import mongoose from 'mongoose';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import SuggestionSource from 'src/backend/shared/constants/SuggestionSource';
import { toJSONPlugin, toObjectPlugin } from './plugins/index';
import { uploadExamplePronunciation } from './plugins/pronunciationHooks';
import { normalizeIgbo } from './plugins/normalizationHooks';

const { Schema, Types } = mongoose;
// @ts-ignore
export const exampleSuggestionSchema = new Schema({
  originalExampleId: {
    type: Types.ObjectId,
    ref: 'Example',
    default: null,
    index: true,
  },
  igbo: { type: String, default: '' },
  english: { type: String, default: '' },
  meaning: { type: String, default: '' },
  nsibidi: { type: String, default: '' },
  style: {
    type: String,
    enum: Object.values(ExampleStyle).map(({ value }) => value),
    default: ExampleStyle.NO_STYLE.value,
  },
  associatedWords: { type: [{ type: Types.ObjectId }], default: [], index: true },
  associatedDefinitionsSchemas: { type: [{ type: Types.ObjectId }], default: [] },
  pronunciation: { type: String, default: '' },
  exampleForSuggestion: { type: Boolean, default: false },
  editorsNotes: { type: String, default: '' },
  userComments: { type: String, default: '' },
  authorEmail: { type: String, default: '' },
  authorId: { type: String, default: '' },
  approvals: { type: [{ type: String }], default: [] },
  denials: { type: [{ type: String }], default: [] },
  source: { type: String, default: SuggestionSource.INTERNAL },
  merged: { type: Types.ObjectId, ref: 'Example', default: null },
  mergedBy: { type: String, default: null },
  userInteractions: { type: [{ type: String }], default: [] },
}, { toObject: toObjectPlugin, timestamps: true });

toJSONPlugin(exampleSuggestionSchema);
uploadExamplePronunciation(exampleSuggestionSchema);
normalizeIgbo(exampleSuggestionSchema);

exampleSuggestionSchema.index({
  authorId: 1,
  mergedBy: 1,
  updatedAt: -1,
}, {
  name: 'Merged example suggestion index',
});

mongoose.model('ExampleSuggestion', exampleSuggestionSchema);
