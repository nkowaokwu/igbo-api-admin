import { Record } from 'react-admin';
import { assign, omit, pick } from 'lodash';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';

const omitPronunciationFields = (pronunciation) => omit(pronunciation, ['id']);

const createDefaultExampleFormValues = (record: Record): any => {
  const data = assign(record, {
    source: assign(record.source || {}, {
      language: LanguageLabels[record.source.language] || LanguageLabels.UNSPECIFIED,
      pronunciations: (record.source?.pronunciations || []).map(omitPronunciationFields),
    }),
    translations: (record.translations || []).map((translation) =>
      assign(translation, {
        language: LanguageLabels[translation.language] || LanguageLabels.UNSPECIFIED,
        pronunciations: (translation?.pronunciations || []).map(omitPronunciationFields),
      }),
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
