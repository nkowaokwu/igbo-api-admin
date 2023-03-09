import { Record } from 'react-admin';
import WordClass from 'src/shared/constants/WordClass';
import Tense from 'src/backend/shared/constants/Tense';
import isVerb from 'src/backend/shared/utils/isVerb';
import { Word } from './interfaces';

export const invalidRelatedTermsWordClasses = [
  WordClass.CJN.value,
  WordClass.DEM.value,
  WordClass.NM.value,
  WordClass.NNP.value,
  WordClass.CD.value,
  WordClass.PREP.value,
  WordClass.ISUF.value,
  WordClass.ESUF.value,
  WordClass.SYM.value,
];

export default (word: Word | Record): boolean => !!(
  word.word
  && word.wordClass
  && (word.word.normalize('NFD').match(/(?!\u0323)[\u0300-\u036f]/g) || (word.attributes || {}).isAccented)
  && Array.isArray(word.definitions) && word.definitions.length
  && (
    Array.isArray(word.examples)
    && word.examples.length
    && word.examples.every(({ pronunciations }) => pronunciations.every((pronunciation) => !!pronunciation))
  )
  && (
    word.dialects && typeof word.dialects === 'object'
    && Array.isArray(word.dialects)
    && word.dialects.length
    && Object.values(word.dialects).every(({ dialects, pronunciation }) => (
      dialects.length && pronunciation
    ))
  )
  && word.pronunciation
  && word.attributes.isStandardIgbo
  && ((Array.isArray(word.stems) && word.stems.length) || word.attributes.isStem)
  && (invalidRelatedTermsWordClasses.includes(word.wordClass)
    || (Array.isArray(word.relatedTerms) && word.relatedTerms.length))
  && isVerb(word.wordClass) && !Object.entries(word.tenses || {}).every(([key, value]) => (
    (value && Object.values(Tense).find(({ value: tenseValue }) => key === tenseValue))
    || (key === Tense.PRESENT_PASSIVE.value)
  ))
);
