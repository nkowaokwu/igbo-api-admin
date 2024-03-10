import { WordData } from 'src/backend/controllers/utils/interfaces';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import Tense from 'src/backend/shared/constants/Tense';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import { dialectFixture, exampleSuggestionFixture } from 'src/__tests__/shared/fixtures';

export const wordSuggestionData = {
  word: 'word',
  definitions: [
    {
      wordClass: WordClassEnum.NNC,
      definitions: ['first'],
      nsibidi: 'nsibidi',
      nsibidiCharacters: ['5f864d7401203866b6546dd4'],
      igboDefinitions: [{ igbo: 'igbo', nsibidi: 'nsibidi' }],
    },
  ],
  dialects: [],
  wordPronunciation: '',
  conceptualWord: '',
  frequency: 2,
};

export const wordSuggestionWithoutIgboDefinitionsData = {
  word: 'word without igbo definition',
  definitions: [
    {
      wordClass: WordClassEnum.NNC,
      definitions: ['first'],
      nsibidi: 'nsibidi',
      nsibidiCharacters: ['5f864d7401203866b6546dd4'],
      igboDefinitions: [],
    },
  ],
  dialects: [],
  wordPronunciation: '',
  conceptualWord: '',
  frequency: 2,
};

export const wordSuggestionApprovedData = {
  originalWordId: '5f864d7401203866b6546dd3',
  word: 'word',
  definitions: [
    {
      wordClass: WordClassEnum.NNC,
      definitions: ['first'],
    },
  ],
  wordPronunciation: '',
  conceptualWord: '',
  approvals: ['first user', 'second user'],
};

export const malformedWordSuggestionData = {
  word: 'word',
  wordCllass: 'wordClass',
  definitions: ['first'],
};

export const updatedWordSuggestionData = {
  word: 'newWord',
  definitions: [
    {
      wordClass: WordClassEnum.ADJ,
      definitions: ['first', 'second'],
    },
  ],
  frequency: 3,
};

export const malformedWordData = {
  worrd: 'newWord',
  definitions: [],
};

export const updatedWordData = {
  word: 'newWord',
  definitions: [
    {
      wordClass: WordClassEnum.AV,
      definitions: [],
    },
  ],
};

export const wordRecord: WordData = {
  word: 'word',
  id: '5f864d7401203866b6546dd0',
  dialects: [
    dialectFixture({
      word: 'word',
      dialects: [DialectEnum.ABI],
      id: 'dialect-id',
    }),
  ],
  definitions: [
    {
      wordClass: WordClassEnum.AV,
      definitions: ['first definition'],
      nsibidi: 'first nsibidi',
      nsibidiCharacters: [],
      igboDefinitions: [],
    },
  ],
  examples: [
    exampleSuggestionFixture({
      id: 'example-id',
      igbo: 'igbo',
      english: 'english',
    }),
  ],
  frequency: 1,
  pronunciation: '',
  relatedTerms: [],
  tenses: Object.values(Tense).reduce((tenses, { value }) => ({ ...tenses, [value]: '' }), {}),
  variations: [],
  conceptualWord: '',
  wordPronunciation: '',
  stems: [],
  tags: [],
};

export const exampleSuggestionData = {
  igbo: 'igbo text',
  english: 'english text',
  pronunciations: [],
  associatedWords: [],
};

export const exampleSuggestionApprovedData = {
  igbo: 'igbo text',
  english: 'english text',
  nsibidi: '人',
  approvals: ['first user', 'second user'],
  associatedWords: [],
};

export const malformedExampleSuggestionData = {
  associatedWords: ['wrong'],
};

export const bulkUploadExampleSuggestionData = {
  english: '',
  type: SentenceTypeEnum.DATA_COLLECTION,
};

export const updatedExampleSuggestionData = {
  igbo: 'updated igbo',
  english: 'updated english',
  associatedWords: ['5f864d7401203866b6546dd3'],
};

export const exampleData = {
  igbo: 'igbo text',
  english: 'english text',
};

export const updatedExampleData = {
  igbo: 'updated igbo text',
  english: 'updated english text',
  associatedWords: ['5f864d7401203866b6546dd3'],
};
export const corpusSuggestionData = {
  title: 'corpus title',
  body: 'corpus body',
  annotations: [],
};

export const updatedCorpusSuggestionData = {
  title: 'updated corpus title',
  body: 'updated corpus body',
  annotations: [],
};

export const malformedCorpusSuggestionData = {
  title: 'corpus title',
  bodyy: 'malformed body',
};

export const wordSuggestionWithNestedExampleSuggestionData = {
  ...wordSuggestionData,
  examples: [exampleSuggestionData],
};

export const wordSuggestionWithNestedMalformedExampleSuggestionData = {
  ...wordSuggestionData,
  examples: [malformedExampleSuggestionData],
};

export const developerData = {
  name: 'Developer',
  email: 'developer@example.com',
  password: 'password',
  host: 'test.com',
};

export const malformedDeveloperData = {
  name: 'Developer',
  email: 'developer@example.com',
  password: 'password',
};
