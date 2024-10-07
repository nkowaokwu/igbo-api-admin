import { pick } from 'lodash';
import { PronunciationData, PronunciationSchema } from 'src/backend/controllers/utils/interfaces';

const leanPronunciation = (pronunciation: PronunciationSchema): PronunciationData =>
  pick(pronunciation, ['approvals', 'denials', 'audio', 'speaker', 'review', 'archived']) as PronunciationData;

export default leanPronunciation;
