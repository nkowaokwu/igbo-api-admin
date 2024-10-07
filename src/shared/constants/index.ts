import { ExampleData, NsibidiCharacter, WordData } from 'src/backend/controllers/utils/interfaces';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';

export const API_ROUTE =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3030' : `https://${window.location.host}`;

export const DEFAULT_WORD_RECORD: WordData = {
  id: '',
  author: '',
  word: '',
  definitions: [
    {
      wordClass: undefined,
      definitions: [],
      label: '',
      igboDefinitions: [],
      nsibidi: '',
      nsibidiCharacters: [],
    },
  ],
  dialects: [],
  examples: [],
  variations: [],
  approvals: [],
  denials: [],
  details: '',
  merged: '',
  // @ts-expect-error
  attributes: Object.values(WordAttributes).reduce(
    (finalSchema, { value }) => ({
      ...finalSchema,
      [value]: false,
    }),
    {},
  ),
  accented: '',
  pronunciation: '',
  stems: [],
  originalWordId: '',
  editorsNotes: '',
  userComments: '',
  updatedAt: new Date(),
};

export const DEFAULT_EXAMPLE_RECORD: ExampleData = {
  id: '',
  source: { language: LanguageEnum.UNSPECIFIED, text: '', pronunciations: [] },
  translations: [{ language: LanguageEnum.UNSPECIFIED, text: '', pronunciations: [] }],
  meaning: '',
  nsibidi: '',
  type: undefined,
  style: undefined,
  nsibidiCharacters: [],
  associatedWords: [],
  associatedDefinitionsSchemas: [],
  updatedAt: new Date(),
  editorsNotes: '',
  userComments: '',
};

export const DEFAULT_NSIBIDI_CHARACTER_RECORD: NsibidiCharacter = {
  id: '',
  nsibidi: '',
  definitions: [],
  wordClass: WordClassEnum.NNC,
};
