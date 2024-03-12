import { Document, Types } from 'mongoose';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import Feedback from 'src/backend/shared/constants/Feedback';

export interface ExampleTranscriptionFeedbackData {
  exampleSuggestionId: Types.ObjectId | string;
  igbo: string;
  humanTranscription: string;
  audioUrl: string;
  feedback: Feedback;
  authorEmail: string;
  authorId: string;
  approvals: string[];
  denials: string[];
  source: SuggestionSourceEnum;
  userInteractions: string[];
}

export interface ExampleTranscriptionFeedback extends Document<ExampleTranscriptionFeedbackData, any, any> {}
