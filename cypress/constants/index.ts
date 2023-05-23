import Dialects from '../../src/backend/shared/constants/Dialects';
import WordClass from '../../src/backend/shared/constants/WordClass';

export const DialectOptions = Dialects;

export const API_ROUTE = process.env.NODE_ENV !== 'production'
  ? 'http://localhost:3030'
  : 'https://editor.igboapi.com';

export const WordClassOptions = WordClass;

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
  SET_AS_TRANSCRIBER: 'Set as Transcriber',
  SET_AS_EDITOR: 'Set as Editor',
  SET_AS_MERGER: 'Set as Merger',
  SET_AS_ADMIN: 'Set as Admin',
  DELETE_USER: 'Delete User',
};

export const wordSuggestionData = {
  word: 'main_word',
  definitions: [{
    definitions: ['first'],
    wordClass: 'NNC',
  }],
  variations: ['main_word_variation'],
  dialects: [
    {
      word: `${Dialects.NSA.value}-main_word`,
      dialects: [Dialects.NSA.value],
      variations: [],
      pronunciation: '',
    },
  ],
  examples: [
    {
      igbo: 'First Igbo nested sentence',
      english: 'First English nested sentence',
      pronunciations: [{ audio: 'data:audio/', speaker: '' }],
      associatedWords: [],
    },
    {
      igbo: 'Second Igbo nested sentence',
      english: 'Second English nested sentence',
      pronunciations: [{ audio: 'data:audio/', speaker: '' }],
      associatedWords: [],
    },
  ],
};

export const exampleSuggestionData = {
  igbo: 'igbo',
  english: '',
  associatedWords: [],
};
