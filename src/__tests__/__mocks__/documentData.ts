import mongoose from 'mongoose';
import WordClass from 'src/shared/constants/WordClass';

const { ObjectId } = mongoose.Types;

const wordId = new ObjectId('5f864d7401203866b6546dd3');
const wordSuggestionId = new ObjectId();
const wordSuggestionData = {
  word: 'word',
  wordClass: WordClass.NNC.value,
  definitions: ['first'],
  dialects: {},
};

const wordSuggestionApprovedData = {
  originalWordId: wordId,
  word: 'word',
  wordClass: WordClass.NNC.value,
  definitions: ['first'],
  approvals: ['first user', 'second user'],
};

const malformedWordSuggestionData = {
  word: 'word',
  wordCllass: 'wordClass',
  definitions: ['first'],
};

const updatedWordSuggestionData = {
  word: 'newWord',
  wordClass: WordClass.ADJ.value,
  definitions: ['first', 'second'],
};

const malformedWordData = {
  worrd: 'newWord',
  wordClass: '',
  definitions: [],
};

const updatedWordData = {
  word: 'newWord',
  wordClass: WordClass.AV.value,
  definitions: [],
};

const exampleSuggestionData = {
  igbo: 'igbo text',
  english: 'english text',
};

const exampleSuggestionApprovedData = {
  igbo: 'igbo text',
  english: 'english text',
  approvals: ['first user', 'second user'],
};

const malformedExampleSuggestionData = {
  associatedWords: ['wrong'],
};

const exampleId = new ObjectId('5f864d7401203866b6546dd3');
const updatedExampleSuggestionData = {
  igbo: 'updated igbo',
  english: 'updated english',
  associatedWords: [exampleId],
};

const exampleData = {
  igbo: 'igbo text',
  english: 'english text',
};

const updatedExampleData = {
  igbo: 'updated igbo text',
  english: 'updated english text',
  associatedWords: ['5f864d7401203866b6546dd3'],
};

const malformedGenericWordData = {
  word: 'newGenericWord',
  wordClass: '',
  definitions: [],
  approvals: 'car',
};

const updatedGenericWordData = {
  word: 'newWord',
  wordClass: 'verb',
  definitions: ['required'],
  approvals: 2,
  denials: 1,
};

const wordSuggestionWithNestedExampleSuggestionData = {
  ...wordSuggestionData,
  examples: [exampleSuggestionData],
};

const developerData = {
  name: 'Developer',
  email: 'developer@example.com',
  password: 'password',
  host: 'test.com',
};

const malformedDeveloperData = {
  name: 'Developer',
  email: 'developer@example.com',
  password: 'password',
};

export {
  wordId,
  wordSuggestionId,
  wordSuggestionData,
  wordSuggestionApprovedData,
  malformedWordSuggestionData,
  updatedWordSuggestionData,
  wordSuggestionWithNestedExampleSuggestionData,
  malformedWordData,
  updatedWordData,
  exampleId,
  exampleSuggestionData,
  exampleSuggestionApprovedData,
  malformedExampleSuggestionData,
  updatedExampleSuggestionData,
  exampleData,
  updatedExampleData,
  malformedGenericWordData,
  updatedGenericWordData,
  developerData,
  malformedDeveloperData,
};
