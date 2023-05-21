import WordClass from 'src/shared/constants/WordClass';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import { Record } from 'react-admin';

const createDefaultWordFormValues = (record: Record): any => {
  const defaultValues = {
    definitions: (record?.definitions || []).map((definition) => ({
      ...definition,
      definitions: (definition?.definitions || []).map((text) => ({ text })),
      wordClass: WordClass[definition?.wordClass] || null,
    })),
    dialects: record?.dialects || [],
    examples: record?.examples
      ? record.examples.map((example) => ({
        ...example,
        pronunciation: example.pronunciation || '',
        nsibidiCharacters: (example.nsibidiCharacters || []).map((id) => ({ id })),
        exampleId: example?.id,
      }))
      : [],
    variations: (record?.variations || []).map((variation) => ({ text: variation })),
    relatedTerms: (record?.relatedTerms || []).map((relatedTerm) => ({ id: relatedTerm })),
    stems: (record?.stems || []).map((stem) => ({ id: stem })),
    tenses: record?.tenses || {},
    pronunciation: record?.pronunciation || '',
    attributes: record?.attributes || Object.values(WordAttributes).reduce((finalAttributes, attribute) => ({
      ...finalAttributes,
      [attribute.value]: false,
    }), {}),
    frequency: record?.frequency,
  };
  return defaultValues;
};

export default createDefaultWordFormValues;
