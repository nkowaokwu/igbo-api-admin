import { cloneDeep } from 'lodash';
import determineIsAsCompleteAsPossible from '../determineIsAsCompleteAsPossible';

const word = {
  word: 'word',
  definitions: [
    { wordClass: 'NNC', definitions: ['first definition'] },
  ],
  pronunciation: 'https://igbo-api-test-local/audio-file',
  examples: [
    {
      igbo: 'igbo',
      english: 'english',
      pronunciations: [{ audio: 'https://igbo-api-test-local/audio-file-example', speaker: '' }],
    },
  ],
  attributes: {
    isStandardIgbo: true,
    isAccented: true,
    isStem: false,
    isComplete: false,
  },
  stems: ['stem-id'],
  relatedTerms: ['related-term-id'],
  dialects: [
    { dialects: ['ABI'], pronunciation: 'https://igbo-api-test-local/audio-file-ABI' },
  ],
  tenses: {},
};

describe('determineIsAsCompleteAsPossible', () => {
  it('determines if word is as complete as possible', () => {
    // @ts-expect-error
    expect(determineIsAsCompleteAsPossible(word)).toBe(true);
  });
  it('determines if word is not as complete as possible because example doesn\'t have pronunciations', () => {
    const testWord = cloneDeep(word);
    testWord.examples[0].pronunciations = [];
    // @ts-expect-error
    expect(determineIsAsCompleteAsPossible(testWord)).toBe(false);
  });
});
