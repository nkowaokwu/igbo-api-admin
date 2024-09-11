import testAuthTokens from 'src/backend/shared/constants/testAuthTokens';

export const LOCAL_ROUTE = '/';
export const TEST_ROUTE = '/test';
export const API_URL = 'https://igboapi.com';

export const SAVE_DOC_DELAY = 2000;

export const EXAMPLE_KEYS = ['source', 'translations', 'associatedWords', 'id', 'updatedAt'];
export const EXAMPLE_SUGGESTION_KEYS = [
  'originalExampleId',
  'source',
  'translations',
  'exampleForSuggestion',
  'associatedWords',
  'associatedDefinitionsSchemas',
  'editorsNotes',
  'userComments',
  'authorEmail',
  'authorId',
  'author',
  'approvals',
  'denials',
  'meaning',
  'nsibidi',
  'nsibidiCharacters',
  'style',
  'origin',
  'userInteractions',
  'pronunciations',
  'createdAt',
  'updatedAt',
  'merged',
  'mergedBy',
  'type',
  'id',
  'crowdsourcing',
];
export const WORD_SUGGESTION_KEYS = [
  'originalWordId',
  'word',
  'definitions',
  'variations',
  'editorsNotes',
  'examples',
  'userComments',
  'authorEmail',
  'authorId',
  'stems',
  'approvals',
  'denials',
  'updatedAt',
  'merged',
  'mergedBy',
  'id',
  'attributes',
];
export const EXCLUDE_KEYS = ['__v', '_id'];
export const SITE_TITLE = 'The First African Language API';
export const INVALID_ID = 'fdsafdsad';
export const MESSAGE = {
  to: ['test@example.com'],
  reply_to: { email: '', name: '' },
  personalizations: [],
  templateId: '',
  dynamic_template_data: {},
};
export const INVALID_MESSAGE = {};
export const AUTH_TOKEN = testAuthTokens;
export const API_KEY = 'fallback_api_key';
export const ORIGIN_HEADER = 'test.com';
