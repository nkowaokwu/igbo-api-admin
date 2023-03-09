import omit from 'lodash/omit';

const OMIT_KEYS = [
  '_id',
  'id',
  'archived',
  'updatedAt',
  'createdAt',
  'type',
  'author',
  'authorEmail',
  'editor',
  'authorId',
  'merged',
  'mergedBy',
  'userInteractions',
  'media',
  'approvals',
  'denials',
  'hypernyms',
  'hyponyms',
  'duration',
  'source',
  'twitterPollId',
];

const removePayloadFields = (payload: any): any => {
  const cleanedPayload = omit(payload, OMIT_KEYS);
  if (Array.isArray(cleanedPayload.definitions)) {
    cleanedPayload.definitions = cleanedPayload.definitions.map((definition) => omit(definition, OMIT_KEYS));
  }
  if (Array.isArray(cleanedPayload.dialects)) {
    cleanedPayload.dialects = cleanedPayload.dialects.map((dialect) => omit(dialect, OMIT_KEYS));
  }
  if (Array.isArray(cleanedPayload.examples)) {
    cleanedPayload.examples = cleanedPayload.examples.map((example) => (
      omit({
        ...example,
        pronunciations: example.pronunciations.map((pronunciation) => omit(pronunciation, ['_id'])),
      }, ['authorId', 'archived'])
    ));
  }
  if (Array.isArray(cleanedPayload.pronunciations)) {
    cleanedPayload.pronunciations = cleanedPayload.pronunciations.map((pronunciation) => omit(pronunciation, ['_id']));
  }
  return cleanedPayload;
};

export default removePayloadFields;
