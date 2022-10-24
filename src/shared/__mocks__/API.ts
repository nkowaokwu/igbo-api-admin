export const getWord = jest.fn(async () => ({
  word: 'retrieved word',
  id: '234',
  wordClass: 'NNC',
  definitions: ['first definition'],
}));

export const resolveWord = jest.fn(async () => ({
  word: 'resolved word',
  id: '567',
  wordClass: 'ADJ',
  definitions: ['resolved word definition'],
}));
