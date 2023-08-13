import { Record } from 'react-admin';
import { omit } from 'lodash';
import WordClass from 'src/backend/shared/constants/WordClass';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';

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
          exampleId: id,
        }))
      : [],
    variations: (record?.variations || []).map((variation) => ({ text: variation })),
    relatedTerms: (record?.relatedTerms || []).map((relatedTerm) => ({ text: relatedTerm })),
    stems: (record?.stems || []).map((stem) => ({ text: stem })),
    tenses: record?.tenses || {},
    pronunciation: record?.pronunciation || '',
    attributes:
      record?.attributes ||
      Object.values(WordAttributeEnum).reduce(
        (finalAttributes, attribute) => ({
          ...finalAttributes,
          [attribute]: false,
        }),
        {},
      ),
    frequency: record?.frequency,
  };
  return defaultValues;
};

export default createDefaultWordFormValues;
