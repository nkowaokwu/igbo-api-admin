import { Record } from 'react-admin';
import { omit, pick } from 'lodash';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';

const createDefaultExampleFormValues = (record: Record): any => ({
  ...omit(record, 'pronunciation'),
  pronunciations: (record?.pronunciations || []).map((pronunciation) => omit(pronunciation, ['id'])),
  style: pick(
    Object.values(ExampleStyle).find(({ value }) => value === record.style),
    ['value', 'label'],
  ) || { value: '', label: '' },
  nsibidiCharacters: (record?.nsibidiCharacters || []).map((nsibidiCharacterId) => ({ text: nsibidiCharacterId })),
  associatedWords: (record?.associatedWords || []).map((associatedWordId) => ({ text: associatedWordId })),
});

export default createDefaultExampleFormValues;
