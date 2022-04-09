import mongoose from 'mongoose';
import { toJSONPlugin, toObjectPlugin } from './plugins/index';
import { uploadExamplePronunciation } from './plugins/pronunciationHooks';
import SuggestionSource from '../shared/constants/SuggestionSource';

const { Schema, Types } = mongoose;
const exampleSuggestionSchema = new Schema({
  originalExampleId: { type: Types.ObjectId, ref: 'Example', default: null },
  igbo: { type: String, default: '' },
  english: { type: String, default: '' },
  associatedWords: { type: [{ type: Types.ObjectId }], default: [] },
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
}, { toObject: toObjectPlugin, timestamps: true });

toJSONPlugin(exampleSuggestionSchema);
uploadExamplePronunciation(exampleSuggestionSchema);

export default mongoose.model('ExampleSuggestion', exampleSuggestionSchema);
