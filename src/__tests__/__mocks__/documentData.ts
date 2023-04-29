import mongoose from 'mongoose';
import SentenceType from 'src/backend/shared/constants/SentenceType';
import WordClass from 'src/shared/constants/WordClass';

const { ObjectId } = mongoose.Types;

export const wordId = new ObjectId('5f864d7401203866b6546dd3');
export const wordSuggestionId = new ObjectId();
export const wordSuggestionData = {
  word: 'word',
  definitions: [{
    wordClass: WordClass.NNC.value,
    definitions: ['first'],
    igboDefinitions: [{ igbo: 'igbo', nsibidi: 'nsibidi' }],
  }],
  dialects: [],
  wordPronunciation: '',
  conceptualWord: '',
  frequency: 2,
};

export const wordSuggestionApprovedData = {
  originalWordId: wordId,
  word: 'word',
  definitions: [{
    wordClass: WordClass.NNC.value,
    definitions: ['first'],
  }],
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
  definitions: [{
    wordClass: WordClass.ADJ.value,
    definitions: ['first', 'second'],
  }],
  frequency: 3,
};

export const malformedWordData = {
  worrd: 'newWord',
  definitions: [],
};

export const updatedWordData = {
  word: 'newWord',
  definitions: [{
    wordClass: WordClass.AV.value,
    definitions: [],
  }],
};

export const exampleSuggestionData = {
  igbo: 'igbo text',
  english: 'english text',
  pronunciation: '',
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
  type: SentenceType.DATA_COLLECTION,
};

export const exampleId = new ObjectId('5f864d7401203866b6546dd3');
export const updatedExampleSuggestionData = {
  igbo: 'updated igbo',
  english: 'updated english',
  associatedWords: [exampleId],
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
export const corpusId = new ObjectId('5f864d7401203866b6546dd5');
export const corpusSuggestionId = new ObjectId();
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
