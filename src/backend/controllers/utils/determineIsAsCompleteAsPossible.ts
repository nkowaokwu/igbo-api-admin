import { Record } from 'react-admin';
import WordClass from 'src/shared/constants/WordClass';
import { Word } from './interfaces';

export default (word: Word | Record): boolean => !!(
  word.word
  && word.wordClass
  && (word.word.normalize('NFD').match(/(?!\u0323)[\u0300-\u036f]/g) || word.attributes.isAccented)
  && Array.isArray(word.definitions) && word.definitions.length
  && (
    Array.isArray(word.examples)
    && word.examples.length
    && word.examples.every(({ pronunciation }) => pronunciation)
  )
  && (
    Object.entries(word.dialects)
    && Object.entries(word.dialects).length
    && Object.values(word.dialects).every(({ dialects, pronunciation }) => (
      dialects.length && pronunciation
    ))
  )
  && word.pronunciation
  && word.attributes.isStandardIgbo
  && word.nsibidi
  && Array.isArray(word.stems) && word.stems.length
  && (word.wordClass === WordClass.NNP.value || (Array.isArray(word.synonyms) && word.synonyms.length))
);
