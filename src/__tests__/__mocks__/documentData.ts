import mongoose from 'mongoose';
import { WordClientData } from 'src/backend/controllers/utils/interfaces';
import Dialects from 'src/backend/shared/constants/Dialects';
import SentenceType from 'src/backend/shared/constants/SentenceType';
import Tense from 'src/backend/shared/constants/Tense';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import WordClass from 'src/backend/shared/constants/WordClass';

const { ObjectId } = mongoose.Types;

const mockDialects = [{
  word: 'word',
  dialects: [Dialects.ABI.value],
  id: 'dialect-id',
  pronunciation: '',
}];

export const wordId = new ObjectId('5f864d7401203866b6546dd3');
export const nsibidiCharacterId = new ObjectId('5f864d7401203866b6546dd4');
export const wordSuggestionId = new ObjectId();
export const wordSuggestionData = {
  word: 'word',
  definitions: [{
    wordClass: WordClass.NNC.value,
    definitions: ['first'],
    nsibidi: 'nsibidi',
    nsibidiCharacters: [nsibidiCharacterId],
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

export const wordRecord: WordClientData = {
  word: 'word',
  id: new ObjectId(),
  dialects: mockDialects,
  definitions: [{
    wordClass: WordClass.AV.value,
    definitions: ['first definition'],
    nsibidi: 'first nsibidi',
    nsibidiCharacters: [],
    igboDefinitions: [],
  }],
  examples: [
    {
      id: 'example-id',
      igbo: 'igbo',
      english: 'english',
      meaning: '',
      nsibidi: '',
      style: undefined,
      nsibidiCharacters: [],
      pronunciations: [],
      associatedWords: [],
    },
  ],
  editorsNotes: '',
  frequency: 1,
  pronunciation: '',
  relatedTerms: [],
  attributes: Object.values(WordAttributes).reduce((attributes, { value }) => {
    if (value !== WordAttributes.IS_COMMON.value && value !== WordAttributes.IS_COMPLETE.value) {
      attributes[value] = false;
    }
    return attributes;
  }, {}),
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
