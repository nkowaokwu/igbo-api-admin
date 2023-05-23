import WordAttributes from 'src/backend/shared/constants/WordAttributes';

export const API_ROUTE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3030'
  : `https://${window.location.host}`;

export const DEFAULT_WORD_RECORD = {
  id: '',
  author: '',
  word: '',
  definitions: [{
    wordClass: '',
    definitions: [],
    label: '',
  }],
  dialects: [],
  examples: [],
  variations: [],
  approvals: [],
  denials: [],
  details: '',
  merged: '',
  attributes: Object.values(WordAttributes).reduce((finalSchema, { value }) => ({
    ...finalSchema,
    [value]: false,
  }), {}),
  accented: '',
  pronunciation: '',
  stems: '',
  originalWordId: '',
  editorsNotes: '',
  userComments: '',
  updatedAt: '',
};

export const DEFAULT_EXAMPLE_RECORD = {
  id: '',
  author: '',
  igbo: '',
  english: '',
  meaning: '',
  nsibidi: '',
  style: undefined,
  pronunciations: [],
  nsibidiCharacters: [],
  associatedWords: [],
  approvals: [],
  denials: [],
  details: '',
  merged: '',
  originalExampleId: '',
  editorsNotes: '',
  userComments: '',
  updatedAt: '',
};
