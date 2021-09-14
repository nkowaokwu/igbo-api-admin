export const API_ROUTE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3030'
  : `https://${window.location.host}`;

export const DEFAULT_RECORD = {
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
  isStandardIgbo: '',
  igbo: '',
  english: '',
  accented: '',
  pronunciation: '',
  stems: '',
  associatedWords: [],
  originalWordId: '',
  originalExampleId: '',
  updatedOn: '',
};
