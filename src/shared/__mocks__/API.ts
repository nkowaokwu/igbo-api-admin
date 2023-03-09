export const getWord = jest.fn(async () => ({
  word: 'retrieved word',
  id: '234',
  definitions: [{
    wordClass: 'NNC',
    definitions: ['first definition'],
  }],
}));

export const getWords = jest.fn(async () => ([
  {
    word: 'retrieved word',
    id: '234',
    definitions: [{
      wordClass: 'NNC',
      definitions: ['first definition'],
    }],
  },
]));

export const getWordSuggestions = jest.fn(async () => ([]));

export const getWordSuggestion = jest.fn(async () => ({
  word: 'retrieved word suggestion',
  id: '567',
  definitions: [{
    wordClass: 'NNC',
    definitions: ['first definition'],
  }],
}));

export const resolveWord = jest.fn(async (stemId, isSuggestion) => ({
  word: `resolved word${isSuggestion ? ' suggestion' : ''}`,
  id: '567',
  definitions: [{
    wordClass: 'ADJ',
    definitions: ['resolved word definition'],
  }],
}));

export const getExample = jest.fn(async () => ({
  igbo: 'igbo',
  english: 'english',
  meaning: '',
  nsibidi: '',
  associatedWords: [],
  associatedDefinitionsSchemas: [],
}));
