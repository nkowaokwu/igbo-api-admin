import { cloneDeep } from 'lodash';
import determineExampleCompleteness from '../determineExampleCompleteness';

const example = {
  igbo: 'igbo',
  english: 'english',
  nsibidi: 'nsibidi',
  nsibidiCharacters: [],
  associatedWords: ['associated-word'],
  pronunciations: [{ audio: 'https://igbo-api-test-local/audio-file-example', speaker: '' }],
};

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
  it('determines example is complete', async () => {
    // @ts-expect-error
    const result = await determineExampleCompleteness(example);
    expect(result.completeExampleRequirements).toHaveLength(0);
  });
  it('determines word is complete because invalid pronunciation', async () => {
    const testExample = cloneDeep(example);
    testExample.pronunciations[0] = { audio: 'invalid-url', speaker: '' };

    // @ts-expect-error
    const result = await determineExampleCompleteness(testExample);
    expect(result.completeExampleRequirements).toHaveLength(1);
  });
});
