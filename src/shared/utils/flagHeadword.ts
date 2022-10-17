/* eslint-disable no-restricted-syntax */
/* eslint-disable no-labels */
import WordClass from 'src/shared/constants/WordClass';
import { flow } from 'lodash';

/** Tone Rules
 * 1. Mid-tone/Down step ( ̄) tone marks can come after unmarked (high tones) and
 * m or n double constants are high tones ✅
 * 2. Words are not allowed to start with a down step ( ̄) ✅
 * 3. A Mid-tone/Down step ( ̄) cannot come after a low-tone (  ̀ ) ✅
 * 4. There can be consecutive Mid-tone/Down steps ( ̄) as long as it's not the first tone ✅
 */

type FlagsType = {
  dashPrefix?: string,
  accentedPair?: string,
  highTone?: string,
};

const vowels = [
  'a',
  'e',
  'i',
  'ị',
  'ị',
  'o',
  'ọ',
  'ọ',
  'u',
  'ụ',
  'ụ',
  'A',
  'E',
  'I',
  'Ị',
  'Ị',
  'O',
  'Ọ',
  'Ọ',
  'U',
  'Ụ',
  'Ụ',
];
const MorN = ['m', 'n', 'M', 'N'];
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

const invalidToneMarkPairings = (
  { word: wordDocument, flags } : { word: { word: string, wordClass: string }, flags: FlagsType },
): { word: { word: string, wordClass: string }, flags: FlagsType } => {
  // Get the word and remove all underdots
  const word = (wordDocument.word || '').normalize('NFD').replace(/[\u0323\s]/g, '');

  // If there's no word, immediate return with collected flags
  if (!word) {
    return { word: wordDocument, flags };
  }

  let firstPointer = 0;
  let hasUnmarkedDoubleConsonant = false;
  let hasMarkedDoubleConsonant = false;
  let hasLowTone = false;
  let hasHighTone = false;
  let lastTone = null;

  while (firstPointer < word.length) {
    const letter = word[firstPointer];
    // If we are at a tone mark, we want to track it and continue to the next letter
    if (letter.charCodeAt(0) === GRAVE_ACCENT) {
      hasLowTone = true;
      lastTone = 'lowTone';
    }

    // If a mid-tone/down-step tone mark comes after a low-tone mark, flag the word
    if (lastTone === 'lowTone' && letter.charCodeAt(0) === MACRON_ACCENT) {
      flags.accentedPair = `Word is unable to have a mid-tone/down-step
       diacritic mark come after a low-tone diacritic mark.`;
      return { word: wordDocument, flags };
    }
    const nextLetter = word[firstPointer + 1] || '';

    // If the current letter is an vowel and the next letter isn't an accent, then we have a high tone
    if (vowels.includes(letter) && !accents.includes(nextLetter.charCodeAt(0))) {
      hasHighTone = true;
      lastTone = 'highTone';
    }
    // If the current and next letter are both consonants, we have a double consonant that's unmarked (high-tone)
    if (
      !vowels.includes(letter)
      && MorN.includes(letter)
      && !vowels.includes(nextLetter)
      && !accents.includes(letter.charCodeAt(0))
      && !accents.includes(nextLetter.charCodeAt(0))
    ) {
      hasUnmarkedDoubleConsonant = true;
      lastTone = 'highTone';
    }
    // If the current letter is a consonant, the next letter is a diacritic, and the letter after that is another
    // consonant, then we have a marked double consonant
    const nextNextLetter = word[firstPointer + 2] || '';
    if (
      !vowels.includes(letter)
      && MorN.includes(letter)
      && !accents.includes(letter.charCodeAt(0))
      && accents.includes(nextLetter.charCodeAt(0))
      && nextNextLetter
      && !vowels.includes(nextNextLetter)
      && !accents.includes(nextNextLetter.charCodeAt(0))
    ) {
      hasMarkedDoubleConsonant = true;

      if (nextLetter.charCodeAt(0) === ACUTE_ACCENT) {
        lastTone = 'lowTone';
      } else if (nextLetter.charCodeAt(0) === MACRON_ACCENT) {
        lastTone = 'midTone';
      }
    }
    // If the letter is a macron, and there is no preceeding low tone, high tone, unmakred double consonant, or
    // marked double consonant, then we want to flag this word
    if (
      letter.charCodeAt(0) === MACRON_ACCENT
      && !hasLowTone
      && !hasHighTone
      && !hasUnmarkedDoubleConsonant
      && !hasMarkedDoubleConsonant
    ) {
      flags.accentedPair = 'Word is unable to start with a mid-tone/down-step diacritic mark.';
      return { word: wordDocument, flags };
    }
    firstPointer += 1;
  }
  return { word: wordDocument, flags };
};

const generateFlags = flow([
  invalidPrefixedDash,
  invalidHighTonePresent,
  invalidToneMarkPairings,
]) as (...any) => { word: { word: string, wordClass: string }, flags: FlagsType };

export default generateFlags;
