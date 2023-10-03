import { cloneDeep } from 'lodash';
import WordTagEnum from 'src/backend/shared/constants/WordTagEnum';
import { combineWords, replaceWordIdsFromExampleAssociatedWords } from '../helpers';

const firstWord = {
  word: 'first word',
  definitions: [
    {
      definitions: ['first word definition'],
      wordClass: 'NNC',
      toObject: () => ({
        definitions: ['first word definition'],
        wordClass: 'NNC',
      }),
    },
  ],
  wordPronunciation: 'first word word pronunciation',
  conceptualWord: 'first word conceptual word',
  stems: ['first word stem'],
  relatedTerms: ['first word related term'],
  variations: ['first word variation'],
  hypernyms: ['first word hypernym'],
  hyponyms: ['first word hyponym'],
  nsibidi: 'first word nsibidi',
  dialects: [
    {
      dialects: ['ANI'],
      word: 'first word dialect',
    },
  ],
  attributes: {
    isStandardIgbo: true,
    isAccented: true,
  },
  tags: [WordTagEnum.BOTANY],
};

const secondWord = {
  word: 'second word',
  definitions: [
    {
      definitions: ['second word definition'],
      wordClass: 'ADV',
      toObject: () => ({
        definitions: ['second word definition'],
        wordClass: 'ADV',
      }),
    },
  ],
  wordPronunciation: 'second word word pronunciation',
  conceptualWord: 'second word conceptual word',
  stems: ['second word stem'],
  relatedTerms: ['second word related term'],
  variations: ['second word variation'],
  hypernyms: ['second word hypernym'],
  hyponyms: ['second word hyponym'],
  nsibidi: 'second word nsibidi',
  dialects: [
    {
      dialects: ['ANI'],
      word: 'second word dialect',
    },
  ],
  attributes: {
    isStandardIgbo: true,
    isAccented: false,
  },
  tags: [WordTagEnum.BOTANY],
};

describe('word helpers', () => {
  it('combines a word object into another with different word classes', () => {
    const updatedWord = combineWords({
      // @ts-expect-error
      wordToCombine: cloneDeep(firstWord),
      // @ts-expect-error
      wordToDelete: cloneDeep(secondWord),
    });

    expect(updatedWord.word).toEqual('first word');
    expect(updatedWord.definitions).toHaveLength(2);
    expect(updatedWord.definitions[0].definitions).toEqual(['first word definition']);
    expect(updatedWord.definitions[0].wordClass).toEqual('NNC');
    // @ts-expect-error
    expect(updatedWord.definitions[1].definitions).toEqual(['second word definition']);
    // @ts-expect-error
    expect(updatedWord.definitions[1].wordClass).toEqual('ADV');
    expect(updatedWord.wordPronunciation).toEqual('first word word pronunciation');
    expect(updatedWord.conceptualWord).toEqual('first word conceptual word');
    expect(updatedWord.stems).toEqual(['first word stem', 'second word stem']);
    expect(updatedWord.relatedTerms).toEqual(['first word related term', 'second word related term']);
    expect(updatedWord.variations).toEqual(['first word variation', 'second word variation']);
    expect(updatedWord.hypernyms).toEqual(['first word hypernym', 'second word hypernym']);
    expect(updatedWord.hyponyms).toEqual(['first word hyponym', 'second word hyponym']);
    expect(updatedWord.nsibidi).toEqual('first word nsibidi');
    expect(updatedWord.dialects).toHaveLength(2);
    expect(updatedWord.dialects[0].dialects).toEqual(['ANI']);
    expect(updatedWord.dialects[0].word).toEqual('first word dialect');
    expect(updatedWord.dialects[1].dialects).toEqual(['ANI']);
    expect(updatedWord.dialects[1].word).toEqual('second word dialect');
    expect(updatedWord.attributes.isStandardIgbo).toEqual(true);
    expect(updatedWord.attributes.isAccented).toEqual(true);
    expect(updatedWord.tags).toEqual([WordTagEnum.BOTANY]);
    expect(updatedWord.pronunciation).toEqual('');
  });

  it('combines a word object into another with the same word classes', () => {
    const updatedSecondDoc = {
      word: 'second word',
      definitions: [
        {
          definitions: ['second word definition'],
          wordClass: 'NNC',
          toObject: () => ({
            definitions: ['second word definition'],
            wordClass: 'NNC',
          }),
        },
      ],
      wordPronunciation: 'second word word pronunciation',
      conceptualWord: 'second word conceptual word',
      stems: ['second word stem'],
      relatedTerms: ['second word related term'],
      variations: ['second word variation'],
      hypernyms: ['second word hypernym'],
      hyponyms: ['second word hyponym'],
      nsibidi: 'second word nsibidi',
      dialects: [
        {
          dialects: ['ANI'],
          word: 'second word dialect',
        },
      ],
      attributes: {
        isStandardIgbo: true,
        isAccented: false,
      },
      tags: [WordTagEnum.BOTANY],
    };

    const updatedWord = combineWords({
      // @ts-expect-error
      wordToCombine: cloneDeep(firstWord),
      // @ts-expect-error
      wordToDelete: updatedSecondDoc,
    });

    expect(updatedWord.word).toEqual('first word');
    expect(updatedWord.definitions).toHaveLength(1);
    expect(updatedWord.definitions[0].definitions).toEqual(['first word definition', 'second word definition']);
    expect(updatedWord.definitions[0].wordClass).toEqual('NNC');
    expect(updatedWord.wordPronunciation).toEqual('first word word pronunciation');
    expect(updatedWord.conceptualWord).toEqual('first word conceptual word');
    expect(updatedWord.stems).toEqual(['first word stem', 'second word stem']);
    expect(updatedWord.relatedTerms).toEqual(['first word related term', 'second word related term']);
    expect(updatedWord.variations).toEqual(['first word variation', 'second word variation']);
    expect(updatedWord.hypernyms).toEqual(['first word hypernym', 'second word hypernym']);
    expect(updatedWord.hyponyms).toEqual(['first word hyponym', 'second word hyponym']);
    expect(updatedWord.nsibidi).toEqual('first word nsibidi');
    expect(updatedWord.dialects).toHaveLength(2);
    expect(updatedWord.dialects[0].dialects).toEqual(['ANI']);
    expect(updatedWord.dialects[0].word).toEqual('first word dialect');
    expect(updatedWord.dialects[1].dialects).toEqual(['ANI']);
    expect(updatedWord.dialects[1].word).toEqual('second word dialect');
    expect(updatedWord.attributes.isStandardIgbo).toEqual(true);
    expect(updatedWord.attributes.isAccented).toEqual(true);
    expect(updatedWord.tags).toEqual([WordTagEnum.BOTANY]);
    expect(updatedWord.pronunciation).toEqual('');
  });

  it('replaces the word ids with the new combined word id for example associate words', async () => {
    const examples = [
      {
        igbo: 'first igbo',
        english: 'first english',
        associatedWords: ['first word'],
        save: () => examples[0],
      },
      {
        igbo: 'second igbo',
        english: 'second english',
        associatedWords: ['first word'],
        save: () => examples[1],
      },
    ];
    const result = await replaceWordIdsFromExampleAssociatedWords(examples, 'first word', 'new word');
    expect(result).toHaveLength(2);
    expect(result[0].associatedWords).toEqual(['new word']);
    expect(result[1].associatedWords).toEqual(['new word']);
  });
});
