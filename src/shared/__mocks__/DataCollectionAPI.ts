const exampleSuggestions = [
  {
    igbo: 'igbo 1',
    id: 'first id',
    english: 'english 1',
    nsibidi: 'nsibidi 1',
    pronunciations: [
      {
        audio: 'first audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'first audio id',
      },
    ],
  },
  {
    igbo: 'igbo 2',
    id: 'second id',
    english: 'english 2',
    nsibidi: 'nsibidi 2',
    pronunciations: [
      {
        audio: 'second audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'second audio id',
      },
    ],
  },
  {
    igbo: 'igbo 3',
    id: 'third id',
    english: 'english 3',
    nsibidi: 'nsibidi 3',
    pronunciations: [
      {
        audio: 'third audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'third audio id',
      },
    ],
  },
  {
    igbo: 'igbo 4',
    id: 'fourth id',
    english: 'english 4',
    nsibidi: 'nsibidi 4',
    pronunciations: [
      {
        audio: 'fourth audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'fourth audio id',
      },
    ],
  },
  {
    igbo: 'igbo 5',
    id: 'fifth id',
    english: 'english 5',
    nsibidi: 'nsibidi 5',
    pronunciations: [
      {
        audio: 'fifth audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'fifth audio id',
      },
    ],
  },
];

export const getRandomExampleSuggestions = jest.fn(async () => ({
  data: exampleSuggestions,
}));

export const getRandomExampleSuggestionsToReview = jest.fn(async () => ({
  data: exampleSuggestions.map((exampleSuggestion, index) => ({
    ...exampleSuggestion,
    pronunciations: [
      {
        audio: 'this-is-audio-recorded-for-the-example',
        speaker: '',
        _id: `${index} pronunciation id`,
      },
    ],
    approvals: [],
    denials: [],
  })),
}));

export const putAudioForRandomExampleSuggestions = jest.fn(async () => {});

export const putReviewForRandomExampleSuggestions = jest.fn(async () => {});

export const getTotalRecordedExampleSuggestions = jest.fn(async () => ({
  count: 0,
}));

export const getTotalVerifiedExampleSuggestions = jest.fn(async () => ({
  count: 0,
}));

export const getLeaderboardStats = jest.fn(async () => ({
  rankings: [],
  userRankings: [],
}));

export const getRandomExampleSuggestionsToTranslate = jest.fn(async () => ({
  data: [{ id: '123', igbo: 'First Igbo', english: '' }],
}));
export const putRandomExampleSuggestionsToTranslate = jest.fn(async () => {});

export const getRandomExampleSuggestionsToRecord = jest.fn(async () => ({ data: exampleSuggestions }));
