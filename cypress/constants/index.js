import Dialects from '../../src/backend/shared/constants/Dialects';

export const DialectOptions = Dialects;

export const API_ROUTE = process.env.NODE_ENV !== 'production'
  ? 'http://localhost:3030'
  : 'https://editor.igboapi.com';

export const WordClassOptions = {
  ADJ: {
    value: 'ADJ',
    label: 'Adjective',
  },
  ADV: {
    value: 'ADV',
    label: 'Adverb',
  },
  V: {
    value: 'V',
    label: 'Verb',
  },
  CJN: {
    value: 'CJN',
    label: 'Conjunction',
  },
  DEM: {
    value: 'DEM',
    label: 'Demonstrative',
  },
  NNC: {
    value: 'NNC',
    label: 'Noun',
  },
  NNP: {
    value: 'NNP',
    label: 'Proper noun',
  },
  CD: {
    value: 'CD',
    label: 'Number',
  },
  PREP: {
    value: 'PREP',
    label: 'Preposition',
  },
  PRN: {
    value: 'PRN',
    label: 'Pronoun',
  },
  FW: {
    value: 'FW',
    label: 'Foreign word',
  },
  QTF: {
    value: 'QTF',
    label: 'Quantifier',
  },
  WH: {
    value: 'WH',
    label: 'Interrogative',
  },
  INTJ: {
    value: 'INTJ',
    label: 'Interjection',
  },
  ISUF: {
    value: 'ISUF',
    label: 'Inflectional suffix',
  },
  ESUF: {
    value: 'ESUF',
    label: 'Extensional suffix',
  },
  SYM: {
    value: 'SYM',
    label: 'Punctuations',
  },
};

const dialectObjects = Object.values(Dialects).reduce((dialectsObject, { value }) => ({
  ...dialectsObject,
  [value]: {
    word: '',
    dialect: value,
    variations: [],
    pronunciation: '',
  },
}), {});

export const DocumentSelectOptions = {
  VIEW: 'View',
  SUGGEST_NEW_EDIT: 'Suggest New Edit',
  COMBINE_WORD_INTO: 'Combine Word Into...',
  REQUEST_DELETE: /(Request to Delete Word)|(Request to Delete Example)/,
};

export const SuggestionSelectOptions = {
  MERGE: 'Merge',
  EDIT: 'Edit',
  VIEW: 'View',
  APPROVE: /Approve|Approved/,
  DENY: /Deny|Denied/,
  NOTIFY: 'Notify',
  DELETE: 'Delete',
};

export const UserSelectOptions = {
  SET_AS_USER: 'Set as User',
  SET_AS_EDITOR: 'Set as Editor',
  SET_AS_MERGER: 'Set as Merger',
  SET_AS_ADMIN: 'Set as Admin',
  ASSIGN_EDITING_GROUP: 'Assign Editing Group',
  DELETE_USER: 'Delete User',
};

export const wordSuggestionData = {
  word: 'this is a worUPDATED',
  wordClass: 'NNC',
  definitions: ['first'],
  variations: ['ok', 'k', 'okok'],
  dialects: {
    ...dialectObjects,
    NSA: {
      word: 'NSA-word',
      dialect: 'NSA',
      variations: [],
      pronunciation: '',
    },
  },
  examples: [
    {
      igbo: 'THIS IS THE NESTED EXAMPLES',
      english: 'ijemma english',
      associatedWords: [],
    },
    {
      igbo: 'Tthis NEWWDS TO WORK PLES',
      english: 'ijemma english',
      associatedWords: [],
    },
  ],
};

export const exampleSuggestionData = {
  igbo: 'igbo',
  english: '',
  associatedWords: [],
};
