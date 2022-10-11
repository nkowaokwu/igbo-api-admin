export const API_ROUTE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3030'
  : `https://${window.location.host}`;

export const DEFAULT_WORD_RECORD = {
  id: '',
  author: '',
  word: '',
  wordClass: '',
  definitions: [],
  dialects: {},
  variations: [],
  approvals: [],
  denials: [],
  details: '',
  merged: '',
  attributes: {
    isStandardIgbo: '',
  },
  accented: '',
  pronunciation: [],
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
  pronunciation: [],
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
