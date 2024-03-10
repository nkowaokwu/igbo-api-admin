import { cloneDeep } from 'lodash';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import { ExampleTranscriptionFeedbackData } from 'src/backend/controllers/utils/interfaces';
import Feedback from 'src/backend/shared/constants/Feedback';

export const exampleTranscriptionFeedbackFixture = (
  data?: Partial<ExampleTranscriptionFeedbackData>,
): ExampleTranscriptionFeedbackData => ({
  exampleSuggestionId: '',
  igbo: 'computer transcription',
  humanTranscription: 'human transcription',
  audioUrl: '',
  feedback: Feedback.INCORRECT,
  authorEmail: '',
  authorId: '',
  approvals: [],
  denials: [],
  source: SuggestionSourceEnum.IGBO_SPEECH,
  userInteractions: [],
  ...cloneDeep(data),
});
