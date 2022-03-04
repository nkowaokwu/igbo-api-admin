import { Record } from 'react-admin';
import { Word } from './interfaces';

export default (word: Word | Record): boolean => !!(
  word.word
  && word.wordClass
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
  && word.isStandardIgbo
  && word.nsibidi
  && Array.isArray(word.stems) && word.stems.length
  && Array.isArray(word.synonyms) && word.synonyms.length
  && Array.isArray(word.antonyms) && word.antonyms.length
);
