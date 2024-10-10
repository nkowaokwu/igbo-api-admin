import { Record } from 'react-admin';
import { assign, pick } from 'lodash';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';

const omitPronunciationFields = (pronunciation) => pick(pronunciation, ['audio', 'speaker', 'archived']);

const createDefaultExampleFormValues = (record: Record = { id: '' }): any => {
  const data = assign(pick(record, ['associatedDefinitionsSchemas', 'editorsNotes', 'meaning', 'nsibidi']), {
    source: {
      text: record.source?.text,
      language: LanguageLabels[record.source?.language] || LanguageLabels.UNSPECIFIED,
      pronunciations: (record.source?.pronunciations || []).map(omitPronunciationFields),
    },
    translations: (record.translations || []).map((translation) => ({
      text: translation.text,
      language: LanguageLabels[translation?.language] || LanguageLabels.UNSPECIFIED,
      pronunciations: (translation?.pronunciations || []).map(omitPronunciationFields),
    })),
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
