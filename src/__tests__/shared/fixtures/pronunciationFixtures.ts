import { cloneDeep } from 'lodash';
import { PronunciationData, PronunciationSchema } from 'src/backend/controllers/utils/interfaces';

export const pronunciationFixture = (data?: Partial<PronunciationData>): PronunciationSchema => ({
  _id: '',
  audio: '',
  speaker: '',
  review: true,
  approvals: [],
  denials: [],
  archived: false,
  ...cloneDeep(data),
});
