import { cloneDeep } from 'lodash';
import { ExampleClientData, WordClientData } from '../interfaces';
import { createNestedExampleSuggestionBody, getExamplesFromClientData } from '../nestedExampleSuggestionUtils';

const word: WordClientData = {
  word: 'word',
  authorId: 'authorId',
  definitions: [{
    wordClass: 'NNC',
    definitions: [],
    igboDefinitions: [],
    nsibidi: '',
    nsibidiCharacters: [],
  }],
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
});
