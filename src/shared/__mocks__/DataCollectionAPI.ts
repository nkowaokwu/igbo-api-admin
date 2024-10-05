import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';

const exampleSuggestions = [
  {
    source: { language: LanguageEnum.IGBO, text: 'igbo 1' },
    translations: [{ language: LanguageEnum.ENGLISH, text: 'english 1' }],
    id: 'first id',
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
    igbo: { language: LanguageEnum.IGBO, text: 'igbo 2' },
    english: [{ language: LanguageEnum.ENGLISH, text: 'english 2' }],
    id: 'second id',
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
    igbo: { language: LanguageEnum.IGBO, text: 'igbo 3' },
    english: [{ language: LanguageEnum.ENGLISH, text: 'english 3' }],
    id: 'third id',
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
    igbo: { language: LanguageEnum.IGBO, text: 'igbo 4' },
    english: [{ language: LanguageEnum.ENGLISH, text: 'english 4' }],
    id: 'fourth id',
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
    igbo: { language: LanguageEnum.IGBO, text: 'igbo 5' },
    english: [{ language: LanguageEnum.ENGLISH, text: 'english 5' }],
    id: 'fifth id',
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

export const getTotalReviewedExampleSuggestions = jest.fn(async () => ({
  timestampedReviewedExampleSuggestions: {},
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

export const postWordSuggestionsForIgboDefinitions = jest.fn(async () => ({ message: 'Success' }));

export const postTextImages = jest.fn(async () => []);

export const attachTextImages = jest.fn(async () => []);
