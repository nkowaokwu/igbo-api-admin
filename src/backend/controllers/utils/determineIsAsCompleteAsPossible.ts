import { Record } from 'react-admin';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import TenseEnum from 'src/backend/shared/constants/TenseEnum';
import isVerb from 'src/backend/shared/utils/isVerb';
import { WordData } from './interfaces';

export const invalidRelatedTermsWordClasses = [
  WordClassEnum.CJN,
  WordClassEnum.DEM,
  WordClassEnum.NM,
  WordClassEnum.NNP,
  WordClassEnum.CD,
  WordClassEnum.PREP,
  WordClassEnum.ISUF,
  WordClassEnum.ESUF,
  WordClassEnum.SYM,
];

export default (word: WordData | Record): boolean =>
  !!(
    word.word &&
    (word.word.normalize('NFD').match(/(?!\u0323)[\u0300-\u036f]/g) || (word.attributes || {}).isAccented) &&
    Array.isArray(word.definitions) &&
    word.definitions.length &&
    Array.isArray(word.examples) &&
    word.examples.length &&
    word.examples.every(
      ({ pronunciations }) => pronunciations.length && pronunciations.every((pronunciation) => !!pronunciation?.audio),
    ) &&
    word.dialects &&
    typeof word.dialects === 'object' &&
    Array.isArray(word.dialects) &&
    word.dialects.length &&
    Object.values(word.dialects).every(({ dialects, pronunciation }) => dialects.length && pronunciation) &&
    word.pronunciation &&
    word.attributes.isStandardIgbo &&
    ((Array.isArray(word.stems) && word.stems.length) || word.attributes.isStem) &&
    (invalidRelatedTermsWordClasses.includes(word.wordClass) ||
      (Array.isArray(word.relatedTerms) && word.relatedTerms.length)) &&
    (isVerb(word.wordClass)
      ? !Object.entries(word.tenses || {}).every(
          ([key, value]) =>
            (value && Object.values(TenseEnum).find((tense) => key === tense)) || key === TenseEnum.PRESENT_PASSIVE,
        )
      : true)
  );
