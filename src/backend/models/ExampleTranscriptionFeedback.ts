import mongoose from 'mongoose';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import Feedback from 'src/backend/shared/constants/Feedback';
import { toJSONPlugin, toObjectPlugin } from './plugins/index';
import { uploadExamplePronunciation } from './plugins/examplePronunciationHook';
import { normalizeIgbo } from './plugins/normalizationHooks';

const { Schema, Types } = mongoose;
export const exampleTranscriptionFeedbackSchema = new Schema(
  {
    exampleSuggestionSchemaId: {
      type: Types.ObjectId,
      ref: 'ExampleSuggestion',
      required: true,
      index: true,
    },
    igbo: { type: String, default: '', trim: true },
    humanTranscription: { type: String, default: '', trim: true },
    audioUrl: { type: String, default: '', trim: true },
    feedback: { type: String, enum: Feedback, default: Feedback.UNSPECIFIED },
    authorEmail: { type: String, default: '' },
    authorId: { type: String, default: '' },
    approvals: { type: [{ type: String }], default: [] },
    denials: { type: [{ type: String }], default: [] },
    source: { type: String, default: SuggestionSourceEnum.INTERNAL },
    userInteractions: { type: [{ type: String }], default: [] },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(exampleTranscriptionFeedbackSchema);
uploadExamplePronunciation(exampleTranscriptionFeedbackSchema);
normalizeIgbo(exampleTranscriptionFeedbackSchema);

exampleTranscriptionFeedbackSchema.index({
  authorId: 1,
  updatedAt: -1,
});

mongoose.model('ExampleTranscriptionFeedback', exampleTranscriptionFeedbackSchema);
