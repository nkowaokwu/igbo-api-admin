import { Example, NsibidiCharacter, Word } from 'src/backend/controllers/utils/interfaces';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';

export const API_ROUTE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3030'
  : `https://${window.location.host}`;

export const DEFAULT_WORD_RECORD: Word = {
  id: '',
  author: '',
  word: '',
  definitions: [{
    wordClass: '',
    definitions: [],
    label: '',
    igboDefinitions: [],
    nsibidi: '',
    nsibidiCharacters: [],
  }],
  dialects: [],
  examples: [],
  variations: [],
  approvals: [],
  denials: [],
  details: '',
  merged: '',
  // @ts-expect-error
  attributes: Object.values(WordAttributes).reduce((finalSchema, { value }) => ({
    ...finalSchema,
    [value]: false,
  }), {}),
  accented: '',
  pronunciation: '',
  stems: [],
  originalWordId: '',
  editorsNotes: '',
  userComments: '',
  updatedAt: new Date(),
};

export const DEFAULT_EXAMPLE_RECORD: Example = {
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
  updatedAt: new Date(),
};

export const DEFAULT_NSIBIDI_CHARACTER_RECORD: NsibidiCharacter = {
  id: '',
  nsibidi: '',
  pronunciation: '',
  definitions: [],
  wordClass: '',
};
