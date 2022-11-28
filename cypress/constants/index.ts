import Dialects from '../../src/backend/shared/constants/Dialects';
import WordClass from '../../src/backend/shared/constants/WordClass';

export const DialectOptions = Dialects;

export const API_ROUTE = process.env.NODE_ENV !== 'production'
  ? 'http://localhost:3030'
  : 'https://editor.igboapi.com';

export const WordClassOptions = WordClass;

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
  VIEW: 'View User',
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
