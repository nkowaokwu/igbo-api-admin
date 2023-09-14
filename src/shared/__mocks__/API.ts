export const getWord = jest.fn(async () => ({
  word: 'retrieved word',
  id: '234',
  definitions: [
    {
      wordClass: 'NNC',
      definitions: ['first definition'],
    },
  ],
}));

export const getWords = jest.fn(async () => [
  {
    word: 'retrieved word',
    id: '234',
    definitions: [
      {
        wordClass: 'NNC',
        definitions: ['first definition'],
      },
    ],
  },
]);

export const getNsibidiCharacter = jest.fn(async () => ({
  nsibidi: 'nsibidi',
  definitions: [{ text: 'first definition' }],
  pronunciations: [{ text: 'first pronunciation' }],
}));

export const getNsibidiCharacters = jest.fn(async () => [
  {
    id: 'nsibidi-123',
    nsibidi: 'nsibidi',
    definitions: [{ text: 'first definition' }],
    pronunciations: [{ text: 'first pronunciation' }],
  },
]);

export const getWordSuggestions = jest.fn(async () => []);

// Used by word stems test
export const resolveWord = jest.fn(async () => ({
  word: 'resolved word',
  id: '567',
  definitions: [
    {
      wordClass: 'ADJ',
      definitions: ['resolved word definition'],
    },
  ],
}));

export const resolveNsibidiCharacter = jest.fn(async () => ({
  nsibidi: 'resolved nsibidi',
  id: 'resolved-nsibidi-987',
  pronunciation: '',
  definitions: [{ text: 'first nsibidi definition' }],
}));

export const getExample = jest.fn(async () => ({
  igbo: 'igbo',
  english: 'english',
  meaning: '',
  nsibidi: '',
  associatedWords: [],
  associatedDefinitionsSchemas: [],
}));

export const getWordSuggestionsWithoutIgboDefinitions = jest.fn(async () => [
  {
    word: 'first retrieved word',
    id: '123',
    definitions: [
      {
        wordClass: 'NNC',
        definitions: ['first definition'],
      },
    ],
  },
  {
    word: 'second retrieved word',
    id: '234',
    definitions: [
      {
        wordClass: 'NNC',
        definitions: ['first definition'],
      },
    ],
  },
  {
    word: 'third retrieved word',
    id: '345',
    definitions: [
      {
        wordClass: 'NNC',
        definitions: ['first definition'],
      },
    ],
  },
  {
    word: 'fourth retrieved word',
    id: '456',
    definitions: [
      {
        wordClass: 'NNC',
        definitions: ['first definition'],
      },
    ],
  },
  {
    word: 'fifth retrieved word',
    id: '567',
    definitions: [
      {
        wordClass: 'NNC',
        definitions: ['first definition'],
      },
    ],
  },
]);

export const putWordSuggestionsWithoutIgboDefinitions = jest.fn();

export const deleteOldWordSuggestions = jest.fn();
