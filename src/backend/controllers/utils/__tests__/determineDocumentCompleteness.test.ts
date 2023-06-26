import { cloneDeep } from 'lodash';
import determineDocumentCompleteness from '../determineDocumentCompleteness';

const word = {
  word: 'word',
  definitions: [{ wordClass: 'NNC', definitions: ['first definition'] }],
  pronunciation: 'https://igbo-api-test-local.com/audio-file',
  examples: [
    {
      igbo: 'igbo',
      english: 'english',
      pronunciations: [{ audio: 'https://igbo-api-test-local.com/audio-file-example', speaker: '' }],
    },
  ],
  attributes: {
    isStandardIgbo: true,
    isAccented: true,
    isStem: false,
    isComplete: false,
  },
  stems: [],
  relatedTerms: [],
  dialects: [{ dialects: ['ABI'], pronunciation: 'https://igbo-api-test-local.com/audio-file-ABI' }],
  tenses: {},
};

describe('determineDocumentCompleteness', () => {
  it('determines word is sufficient', async () => {
    // @ts-expect-error
    const result = await determineDocumentCompleteness(word);
    expect(result.sufficientWordRequirements).toHaveLength(0);
    expect(result.recommendRevisiting).toBeFalsy();
  });
  it('determines word is not complete', async () => {
    // @ts-expect-error
    const result = await determineDocumentCompleteness(word);
    expect(result.completeWordRequirements).toHaveLength(2);
  });

  it('determines word is not complete because it has no example audio', async () => {
    const updatedWord = cloneDeep(word);
    updatedWord.examples[0].pronunciations = [];
    // @ts-expect-error
    const result = await determineDocumentCompleteness(updatedWord);
    expect(result.completeWordRequirements).toHaveLength(3);
  });
  it('determines word is complete', async () => {
    const testWord = cloneDeep(word);
    testWord.stems = ['first stem'];
    testWord.relatedTerms = ['first related term'];

    // @ts-expect-error
    const result = await determineDocumentCompleteness(testWord);
    expect(result.completeWordRequirements).toHaveLength(0);
  });
  it('determines word is complete because invalid pronunciation', async () => {
    const testWord = cloneDeep(word);
    testWord.pronunciation = 'invalid-url';
    testWord.stems = ['first stem'];
    testWord.relatedTerms = ['first related term'];

    // @ts-expect-error
    const result = await determineDocumentCompleteness(testWord);
    expect(result.completeWordRequirements).toHaveLength(1);
  });
  it('determines word should be revisited', async () => {
    const testWord = cloneDeep(word);
    testWord.attributes.isComplete = true;
    testWord.relatedTerms = ['first related term'];

    // @ts-expect-error
    const result = await determineDocumentCompleteness(testWord);
    expect(result.completeWordRequirements).toHaveLength(1);
    expect(result.recommendRevisiting).toBe(true);
  });
});
