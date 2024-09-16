import { Record } from 'react-admin';
import { assign, omit, pick } from 'lodash';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';

const omitPronunciationFields = (pronunciation) => omit(pronunciation, ['id']);

const createDefaultExampleFormValues = (record: Record): any => {
  const data = assign(record, {
    source: assign(record.source || {}, {
      pronunciations: (record.source?.pronunciations || []).map(omitPronunciationFields),
    }),
    translations: (record.translations || []).map((translation) =>
      assign(translation, { pronunciations: (translation?.pronunciations || []).map(omitPronunciationFields) }),
    ),
    style: pick(
      Object.values(ExampleStyle).find(({ value }) => value === record.style),
      ['value', 'label'],
    ) || { value: '', label: '' },
    nsibidiCharacters: (record?.nsibidiCharacters || []).map((nsibidiCharacterId) => ({ text: nsibidiCharacterId })),
    associatedWords: (record?.associatedWords || []).map((associatedWordId) => ({ text: associatedWordId })),
  });
  return data;
};

export default createDefaultExampleFormValues;
