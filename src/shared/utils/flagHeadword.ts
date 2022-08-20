/* eslint-disable no-restricted-syntax */
/* eslint-disable no-labels */
import WordClass from 'src/shared/constants/WordClass';
import { flow } from 'lodash';

type FlagsType = {
  dashPrefix?: string,
  accentedPair?: string,
  highTone?: string,
};

const vowels = ['a', 'e', 'i', 'ị', 'ị', 'o', 'ọ', 'ọ', 'u', 'ụ', 'ụ'];
const nOrM = ['n', 'N', 'm', 'M'];
const GRAVE_ACCENT = 768;
const ACUTE_ACCENT = 769;
const MACRON_ACCENT = 772;
const accents = [GRAVE_ACCENT, ACUTE_ACCENT, MACRON_ACCENT];

const invalidPrefixedDash = (
  { word: wordDocument, flags } : { word: { word: string, wordClass: string }, flags: FlagsType },
): { word: { word: string, wordClass: string }, flags: FlagsType } => {
  const { word, wordClass } = wordDocument;
  if (word && word.startsWith('-') && wordClass !== WordClass.ESUF.value) {
    flags.dashPrefix = 'There is an invalid prefixed dash that shouldn\'t be present for this word. '
    + 'Only Extensional suffixes can have prefixed dashes';
  } else if (word && word.startsWith('-') && wordClass === WordClass.ESUF.value) {
    delete flags.dashPrefix;
  }
  return { word: wordDocument, flags };
};

const invalidToneMarkPairings = (
  { word: wordDocument, flags } : { word: { word: string, wordClass: string }, flags: FlagsType },
): { word: { word: string, wordClass: string }, flags: FlagsType } => {
  const { word } = wordDocument;
  if (word) {
    const firstLetter = word[0];
    const startsWithNOrMConsonantCluster = nOrM.includes(firstLetter) && word[1] && !vowels.includes(word[1]);
    topLoop:
    for (let k = 0; k < word.length; k += 1) {
      const letter = word[k];
      if (vowels.includes(letter) && word.charCodeAt(k + 1) === MACRON_ACCENT) {
        let previousVowel = null;
        let previousVowelIndex = -1;
        if (k === 0) {
          flags.accentedPair = `In order to have a down step (${String.fromCharCode(MACRON_ACCENT)}) accent `
          + 'present in this word, the vowel before the macron vowel must be a high tone.';
          break;
        }
        for (let i = k - 1; i >= 0; i -= 1) {
          const currentLetter = word[i];
          previousVowel = vowels.includes(currentLetter) ? currentLetter : null;
          previousVowelIndex = i;
          const isMarkedVowel = vowels.includes(currentLetter) && accents.includes(word.charCodeAt(i + 1));
          const isPreviousVowelMarked = previousVowel
            && vowels.includes(previousVowel)
            && accents.includes(word.charCodeAt(previousVowelIndex + 1));
          if (
            (isMarkedVowel && !startsWithNOrMConsonantCluster)
            || (startsWithNOrMConsonantCluster && isPreviousVowelMarked && isMarkedVowel)
          ) {
            flags.accentedPair = `In order to have a down step (${String.fromCharCode(MACRON_ACCENT)}) accent `
          + 'present in this word, the vowel before the macron vowel must be a high tone.';
            break topLoop;
          }
          if (
            i === 0
            && (
              (!previousVowel && !startsWithNOrMConsonantCluster)
              || (startsWithNOrMConsonantCluster && isPreviousVowelMarked && isMarkedVowel)
            )) {
            flags.accentedPair = `In order to have a down step (${String.fromCharCode(MACRON_ACCENT)}) accent `
          + 'present in this word, the vowel before the macron vowel must be a high tone.';
            break topLoop;
          }
        }
        if (k === word.length - 1) {
          delete flags.accentedPair;
        }
      }
    }
  }
  return { word: wordDocument, flags };
};

const invalidHighTonePresent = (
  { word: wordDocument, flags } : { word: { word: string, wordClass: string }, flags: FlagsType },
): { word: { word: string, wordClass: string }, flags: FlagsType } => {
  const { word } = wordDocument;
  if (word) {
    for (let i = 0; i < word.length; i += 1) {
      const letter = word.charCodeAt(i);
      if (letter === ACUTE_ACCENT) {
        flags.highTone = 'There should be no high tone accent mark for this word. '
        + 'All unmarked accent marks are automatically high toned.';
        break;
      }
      if (i === word.length - 1) {
        delete flags.highTone;
      }
    }
  }
  return { word: wordDocument, flags };
};

const generateFlags = flow([
  invalidPrefixedDash,
  invalidToneMarkPairings,
  invalidHighTonePresent,
]) as (...any) => { word: { word: string, wordClass: string }, flags: FlagsType };

export default generateFlags;
