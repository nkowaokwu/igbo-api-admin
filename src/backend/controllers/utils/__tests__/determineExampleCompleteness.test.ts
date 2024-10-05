import { cloneDeep } from 'lodash';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import { exampleFixture } from 'src/__tests__/shared/fixtures';
import determineExampleCompleteness from '../determineExampleCompleteness';

const example = exampleFixture({
  source: {
    text: 'igbo',
    pronunciations: [
      {
        _id: 'id',
        audio: 'https://igbo-api-test-local.com/audio-file-example',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        archived: false,
      },
    ],
    language: LanguageEnum.IGBO,
  },
  translations: [{ text: 'english', pronunciations: [], language: LanguageEnum.ENGLISH }],
  nsibidi: 'nsibidi',
  nsibidiCharacters: [],
  associatedWords: ['associated-word'],
});

describe('determineExampleCompleteness', () => {
  it('determines example is sufficient', async () => {
    // @ts-expect-error
    const result = await determineExampleCompleteness(example);
    expect(result.sufficientExampleRequirements).toHaveLength(0);
  });
  it('determines example is not complete', async () => {
    const testExample = cloneDeep(example);
    testExample.associatedWords = [];
    // @ts-expect-error
    const result = await determineExampleCompleteness(testExample);
    expect(result.completeExampleRequirements).toHaveLength(1);
  });
  it('determines example is not complete with no pronunciations', async () => {
    const testExample = cloneDeep(example);
    testExample.source.pronunciations = [];
    // @ts-expect-error
    const result = await determineExampleCompleteness(testExample);
    expect(result.completeExampleRequirements).toHaveLength(1);
  });
  it('determines example is complete', async () => {
    // @ts-expect-error
    const result = await determineExampleCompleteness(example);
    expect(result.completeExampleRequirements).toHaveLength(0);
  });
  it('determines word is complete because invalid pronunciation', async () => {
    const testExample = cloneDeep(example);
    testExample.source.pronunciations[0].audio = 'invalid-url';
    testExample.source.pronunciations[0].speaker = '';

    // @ts-expect-error
    const result = await determineExampleCompleteness(testExample);
    expect(result.completeExampleRequirements).toHaveLength(1);
  });
});
