import { pick } from 'lodash';
import { OutgoingTranslation, Translation } from 'src/backend/controllers/utils/interfaces';

const leanTranslation = (translation: Translation): OutgoingTranslation =>
  pick(translation, ['approvals', 'denials', 'pronunciations', 'authorId', 'language', 'text']);

export default leanTranslation;
