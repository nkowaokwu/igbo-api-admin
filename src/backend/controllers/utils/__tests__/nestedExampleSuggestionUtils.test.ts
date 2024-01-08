import { cloneDeep } from 'lodash';
import { connectDatabase } from 'src/backend/utils/database';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import { suggestNewExample, createExample, suggestNewWord, createWord } from 'src/__tests__/shared/commands';
import { AUTH_TOKEN } from 'src/__tests__/shared/constants';
import { exampleSuggestionData, wordSuggestionData } from 'src/__tests__/__mocks__/documentData';
import { ExampleClientData, WordClientData } from '../interfaces';
import {
  createNestedExampleSuggestionBody,
  getExamplesFromClientData,
  assignExampleSuggestionToExampleData,
} from '../nestedExampleSuggestionUtils';

const word: WordClientData = {
  word: 'word',
  authorId: 'authorId',
  definitions: [
    {
      wordClass: 'NNC',
      definitions: [],
      igboDefinitions: [],
      nsibidi: '',
      nsibidiCharacters: [],
    },
  ],
  pronunciation: '',
  examples: [
    // @ts-expect-error
    {
      originalExampleId: null,
      igbo: 'igbo',
      english: 'english',
      pronunciations: [],
      nsibidiCharacters: [],
    },
  ],
};

const clientData: ExampleClientData = {
  igbo: 'igbo',
  english: 'english',
  nsibidi: 'nsibidi',
  nsibidiCharacters: ['nsibidi-character'],
  associatedWords: [],
  pronunciations: [{ audio: 'audio', speaker: 'speaker-id' }],
};

describe('nestedExampleSuggestionUtils', () => {
  beforeEach(async () => {
    await dropMongoDBCollections();
  });
  it('creates a new example with example client data with user as author', () => {
    const createdExample = createNestedExampleSuggestionBody({
      example: clientData,
      user: { uid: 'uid' },
      suggestionDocId: 'suggestion-doc-id',
    });
    expect(createdExample).toEqual({
      ...clientData,
      authorId: 'uid',
      exampleForSuggestion: true,
      associatedWords: ['suggestion-doc-id'],
    });
  });

  it('creates a new example with example client data with originalExampleId', () => {
    const createdExample = createNestedExampleSuggestionBody({
      example: { ...clientData, originalExampleId: 'original-example-id' },
      user: { uid: 'uid' },
      suggestionDocId: 'suggestion-doc-id',
    });
    expect(createdExample).toEqual({
      ...clientData,
      originalExampleId: 'original-example-id',
      authorId: null,
      exampleForSuggestion: true,
      associatedWords: ['suggestion-doc-id'],
    });
  });

  it('getExamplesFromClientData removes the originalExampleId', () => {
    const examples = getExamplesFromClientData(word);
    expect(examples[0]).not.toHaveProperty('originalExampleId');
    expect(examples[0].authorId).toEqual('authorId');
  });

  it('getExamplesFromClientData removes the originalExampleId', () => {
    const testWord = cloneDeep(word);
    testWord.examples = [
      // @ts-expect-error
      {
        originalExampleId: 'originalExampleId',
        igbo: 'igbo',
        english: 'english',
        pronunciations: [],
        nsibidiCharacters: [],
      },
    ];
    const examples = getExamplesFromClientData(testWord);
    expect(examples[0].originalExampleId).toEqual('originalExampleId');
    expect(examples[0].authorId).toEqual('authorId');
  });

  it('assignExampleSuggestionToExampleData_success', async () => {
    const mongooseConnection = await connectDatabase();
    const wordSuggestionRes = await suggestNewWord(wordSuggestionData);
    expect(wordSuggestionRes.status).toEqual(200);
    const mergedWordRes = await createWord(wordSuggestionRes.body.id);
    expect(mergedWordRes.status).toEqual(200);
    const res = await suggestNewExample({ ...exampleSuggestionData, associatedWords: [mergedWordRes.body.id] });
    expect(res.status).toEqual(200);

    const exampleRes = await assignExampleSuggestionToExampleData({
      wordSuggestion: { ...wordSuggestionData, id: wordSuggestionRes.body.id },
      originalWord: { ...wordSuggestionData, id: mergedWordRes.body.id, toObject: jest.fn() },
      mergedBy: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
      mongooseConnection,
    });
    expect(exampleRes.length).toEqual(0);
  });

  it('assignExampleSuggestionToExampleData_failure', async () => {
    const mongooseConnection = await connectDatabase();
    const wordSuggestionRes = await suggestNewWord(wordSuggestionData);
    expect(wordSuggestionRes.status).toEqual(200);
    const mergedWordRes = await createWord(wordSuggestionRes.body.id);
    expect(mergedWordRes.status).toEqual(200);
    const res = await suggestNewExample({ ...exampleSuggestionData, associatedWords: [mergedWordRes.body.id] });
    expect(res.status).toEqual(200);
    const mergingExampleSuggestion = { ...res.body, ...exampleSuggestionData };
    const result = await createExample(mergingExampleSuggestion.id);
    expect(result.status).toEqual(200);

    await assignExampleSuggestionToExampleData({
      wordSuggestion: { ...wordSuggestionData, id: wordSuggestionRes.body.id },
      originalWord: { ...wordSuggestionData, id: mergedWordRes.body.id, toObject: jest.fn() },
      mergedBy: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
      mongooseConnection,
    }).catch(() => {
      // console.log(err.message);
    });
  });
});
