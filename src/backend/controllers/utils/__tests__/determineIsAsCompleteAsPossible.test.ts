import { cloneDeep } from 'lodash';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import determineIsAsCompleteAsPossible from '../determineIsAsCompleteAsPossible';

const word = {
  word: 'word',
  definitions: [{ wordClass: 'NNC', definitions: ['first definition'] }],
  pronunciation: 'https://igbo-api-test-local.com/audio-file',
  examples: [
    {
      source: {
        text: 'igbo',
        language: LanguageEnum.IGBO,
        pronunciations: [{ audio: 'https://igbo-api-test-local.com/audio-file-example', speaker: '' }],
      },
      english: { text: 'english', language: LanguageEnum.ENGLISH, pronunciations: [] },
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
  dialects: [{ dialects: ['ABI'], pronunciation: 'https://igbo-api-test-local.com/audio-file-ABI' }],
  tenses: {},
};

describe('determineIsAsCompleteAsPossible', () => {
  it('determines if word is as complete as possible', () => {
    // @ts-expect-error
    expect(determineIsAsCompleteAsPossible(word)).toBe(true);
  });
  it("determines if word is not as complete as possible because example doesn't have pronunciations", () => {
    const testWord = cloneDeep(word);
    testWord.examples[0].source.pronunciations = [];
    // @ts-expect-error
    expect(determineIsAsCompleteAsPossible(testWord)).toBe(false);
  });
});
