import { Request, Response, NextFunction } from 'express';
import Example from '../models/Example';
import Word from '../models/Word';
import {
  searchForAllWordsWithAudioPronunciations,
  searchForAllWordsWithIsStandardIgbo,
  searchForAllWordsWithNsibidi,
} from './utils/queries';
import { findWordsWithMatch } from './utils/buildDocs';
import determineDocumentCompleteness from './utils/determineDocumentCompleteness';

/* Returns all the WordSuggestions with Headword audio pronunciations */
export const getTotalHeadwordsWithAudioPronunciations = async (
  _: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const audioPronunciationWords = await Word
      .countDocuments(searchForAllWordsWithAudioPronunciations());
    return res.send({ count: audioPronunciationWords });
  } catch (err) {
    return next(err);
  }
};

/* Returns all the WordSuggestions that's in Standard Igbo */
export const getTotalWordsInStandardIgbo = async (
  _: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const isStandardIgboWords = await Word
      .countDocuments(searchForAllWordsWithIsStandardIgbo());
    return res.send({ count: isStandardIgboWords });
  } catch (err) {
    return next(err);
  }
};

/* Returns all the Examples that are on the platform */
export const getTotalExampleSentences = async (
  _: Request,
  res: Response,
  next: NextFunction,
) : Promise<Response | void> => {
  try {
    const exampleSentences = await Example
      .countDocuments({});
    return res.send({ count: exampleSentences });
  } catch (err) {
    return next(err);
  }
};

/* Returns all Words with Nsịbịdị */
export const getTotalWordsWithNsibidi = async (
  _: Request,
  res: Response,
  next: NextFunction,
) : Promise<Response | void> => {
  try {
    const wordsWithNsibidi = await Word
      .countDocuments(searchForAllWordsWithNsibidi());
    return res.send({ count: wordsWithNsibidi });
  } catch (err) {
    return next(err);
  }
};

/* Returns all the Words that are "sufficient" */
export const getSufficientWords = async (
  _: Request,
  res: Response,
  next: NextFunction,
) : Promise<Response | void> => {
  try {
    const INCLUDE_ALL_WORDS_LIMIT = 100000;
    const words = await findWordsWithMatch({
      match: { word: { $regex: /./ }, isStandardIgbo: { $eq: true } },
      examples: true,
      limit: INCLUDE_ALL_WORDS_LIMIT,
    });
    const count = words.filter(({
      word,
      wordClass,
      definitions,
      isStandardIgbo,
      pronunciation,
      examples,
      isComplete,
    }) => {
      const automaticCheck = (
        word
        // String normalization check:
        // https://www.codegrepper.com/code-examples/javascript/check+if+word+has+accented+or+unaccented+javascript
        // Filtering character in regex code: https://regex101.com/r/mL0eG4/1
        && word.normalize('NFD').match(/(?!\u0323)[\u0300-\u036f]/g)
        && wordClass
        && Array.isArray(definitions) && definitions.length >= 1
        && Array.isArray(examples) && examples.length >= 1
        && pronunciation.length > 10
        && isStandardIgbo
      );
      const manualCheck = isComplete;
      return automaticCheck || manualCheck;
    }).length;
    return res.send({ count });
  } catch (err) {
    return next(err);
  }
};

/* Returns all the Words that are "complete" */
export const getCompletedWords = async (
  _: Request,
  res: Response,
  next: NextFunction,
) : Promise<Response | void> => {
  try {
    const INCLUDE_ALL_WORDS_LIMIT = 100000;
    const words = await findWordsWithMatch({
      match: { word: { $regex: /./ }, isStandardIgbo: { $eq: true } },
      examples: true,
      limit: INCLUDE_ALL_WORDS_LIMIT,
    });
    const count = words.filter((word) => {
      const { completeWordRequirements } = determineDocumentCompleteness(word);
      const manualCheck = word.isComplete;
      return manualCheck || !completeWordRequirements.length || (
        completeWordRequirements.length === 1
        && completeWordRequirements.includes('The headword is needed')
      );
    }).length;
    return res.send({ count });
  } catch (err) {
    return next(err);
  }
};
