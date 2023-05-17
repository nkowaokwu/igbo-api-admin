const exampleSuggestions = [
  {
    igbo: 'igbo 1',
    english: 'english 1',
    nsibidi: 'nsibidi 1',
    pronunciation: '',
  },
  {
    igbo: 'igbo 2',
    english: 'english 2',
    nsibidi: 'nsibidi 2',
    pronunciation: '',
  },
  {
    igbo: 'igbo 3',
    english: 'english 3',
    nsibidi: 'nsibidi 3',
    pronunciation: '',
  },
  {
    igbo: 'igbo 4',
    english: 'english 4',
    nsibidi: 'nsibidi 4',
    pronunciation: '',
  },
  {
    igbo: 'igbo 5',
    english: 'english 5',
    nsibidi: 'nsibidi 5',
    pronunciation: '',
  },
];

export const getRandomExampleSuggestions = jest.fn(async () => ({
  data: exampleSuggestions,
}));

export const getRandomExampleSuggestionsToReview = jest.fn(async () => ({
  data: exampleSuggestions.map((exampleSuggestion) => ({
    ...exampleSuggestion,
    pronunciation: 'this-is-audio-recorded-for-the-example',
    approvals: [],
    denials: [],
  })),
}));

export const putRandomExampleSuggestions = jest.fn(async () => {});

export const getTotalRecordedExampleSuggestions = jest.fn(async () => ({
  count: 0,
}));

export const getTotalVerifiedExampleSuggestions = jest.fn(async () => ({
  count: 0,
}));
