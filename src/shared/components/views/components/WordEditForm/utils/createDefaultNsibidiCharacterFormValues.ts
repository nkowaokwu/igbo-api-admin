import { Record } from 'react-admin';
import WordClass from 'src/backend/shared/constants/WordClass';

const createDefaultNsibidiCharacterFormValues = (record: Record): any => ({
  ...(record || {}),
  wordClass: {
    label: WordClass[record.wordClass]?.label || '',
    value: WordClass[record.wordClass]?.value || '',
  },
});

export default createDefaultNsibidiCharacterFormValues;
