import { Record } from 'react-admin';
import { omit, pick } from 'lodash';
import WordClass from 'src/backend/shared/constants/WordClass';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import WordTags from 'src/backend/shared/constants/WordTags';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';

const createDefaultWordFormValues = (record: Record): any => {
  const defaultValues = {
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
      ? record.examples.map(({ id, ...example }) => ({
          ...example,
          nsibidiCharacters: (example.nsibidiCharacters || []).map((nsibidiCharacterId) => ({
            id: nsibidiCharacterId,
          })),
          style: pick(ExampleStyle[example?.style] || ExampleStyle[ExampleStyleEnum.NO_STYLE], ['value', 'label']),
          exampleId: id,
        }))
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
