import { Record } from 'react-admin';
import { omit } from 'lodash';
import WordClass from 'src/backend/shared/constants/WordClass';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import WordTags from 'src/backend/shared/constants/WordTags';
import createDefaultExampleFormValues from 'src/shared/components/views/components/WordEditForm/utils/createDefaultExampleFormValues';

const createDefaultWordFormValues = (record: Record): any => {
  const defaultValues = {
    word: record?.word,
    definitions: (record?.definitions || []).map((definition) =>
      omit(
        {
          ...definition,
          definitions: (definition?.definitions || []).map((text) => ({ text })),
          wordClass: WordClass[definition?.wordClass] || null,
          nsibidiCharacters: (definition?.nsibidiCharacters || []).map((nsibidiCharacterId) => ({
            text: nsibidiCharacterId,
          })),
          nsibidi: definition?.nsibidi || undefined,
        },
        ['id'],
      ),
    ),
    dialects: record?.dialects || [],
    examples: record?.examples
      ? record.examples.map((example) => {
          const defaultExample = createDefaultExampleFormValues(example);
          defaultExample.exampleId = example.id;
          return defaultExample;
        })
      : [],
    tags: (record?.tags || []).map((tag) => WordTags[tag]),
    variations: (record?.variations || []).map((variation) => ({ text: variation })),
    relatedTerms: (record?.relatedTerms || []).map((relatedTerm) => ({ text: relatedTerm })),
    stems: (record?.stems || []).map((stem) => ({ text: stem })),
    tenses: record?.tenses || {},
    pronunciation: record?.pronunciation || '',
    attributes: Object.entries(WordAttributeEnum).reduce(
      (finalAttributes, [key, value]) => ({
        ...finalAttributes,
        [value]: record?.attributes?.[key] || false,
      }),
      {},
    ),
    frequency: record?.frequency || 1,
    twitterPollId: record?.twitterPollId || undefined,
    conceptualWord: record?.conceptualWord || undefined,
    wordPronunciation: record?.wordPronunciation || undefined,
    editorsNotes: record?.editorsNotes || undefined,
  };
  return defaultValues;
};

export default createDefaultWordFormValues;
