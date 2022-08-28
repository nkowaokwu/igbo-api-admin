import { Request, Response, NextFunction } from 'express';
import { compact } from 'lodash';
import Example from '../models/Example';
import Word from '../models/Word';
import WordSuggestion from '../models/WordSuggestion';
import ExampleSuggestion from '../models/ExampleSuggestion';
import {
  searchForAllWordsWithAudioPronunciations,
  searchForAllWordsWithIsStandardIgbo,
  searchForAllWordsWithNsibidi,
} from './utils/queries';
import { findWordsWithMatch } from './utils/buildDocs';
import determineDocumentCompleteness from './utils/determineDocumentCompleteness';
import determineExampleCompleteness from './utils/determineExampleCompleteness';
import determineIsAsCompleteAsPossible from './utils/determineIsAsCompleteAsPossible';

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

/* Returns all the Words that's in Standard Igbo */
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

/* Returns all Word Suggestions with Nsịbịdị */
export const getTotalWordSuggestionsWithNsibidi = async (
  _: Request,
  res: Response,
  next: NextFunction,
) : Promise<Response | void> => {
  try {
    const wordSuggestionsWithNsibidi = await WordSuggestion
      .countDocuments({ ...searchForAllWordsWithNsibidi(), merged: null });
    return res.send({ count: wordSuggestionsWithNsibidi });
  } catch (err) {
    return next(err);
  }
};

const countWords = async (words) => {
  let sufficientWordsCount = 0;
  let completeWordsCount = 0;
  let dialectalVariationsCount = 0;
  await Promise.all(words.map(async (word) => {
    const isAsCompleteAsPossible = determineIsAsCompleteAsPossible(word);
    const { sufficientWordRequirements, completeWordRequirements } = await determineDocumentCompleteness(word);
    const manualCheck = word.isComplete && isAsCompleteAsPossible;
    // Tracks total sufficient words
    const isSufficientWord = !sufficientWordRequirements.length;
    if (isSufficientWord) {
      sufficientWordsCount += 1;
    }
    // Tracks total complete words
    const isCompleteWord = manualCheck || !completeWordRequirements.length || (
      completeWordRequirements.length === 1
      && completeWordRequirements.includes('The headword is needed')
    );
    if (isCompleteWord) {
      completeWordsCount += 1;
    }
    // Tracks total dialectal variations
    dialectalVariationsCount += (Object.keys(word.dialects || {}).length + 1);
  }));

  return { sufficientWordsCount, completeWordsCount, dialectalVariationsCount };
};

/* Returns all the Words that are "sufficient" */
export const getWordStats = async (
  _: Request,
  res: Response,
  next: NextFunction,
) : Promise<Response | void> => {
  try {
    const INCLUDE_ALL_WORDS_LIMIT = 100000;
    const words = await findWordsWithMatch({
      match: { word: { $regex: /./ }, 'attributes.isStandardIgbo': { $eq: true } },
      examples: true,
      limit: INCLUDE_ALL_WORDS_LIMIT,
    });
    const { sufficientWordsCount, completeWordsCount, dialectalVariationsCount } = await countWords(words);
    return res.send({ sufficientWordsCount, completeWordsCount, dialectalVariationsCount });
  } catch (err) {
    return next(err);
  }
};

const countCompletedExamples = async (examples) => {
  const sufficientExamplesCount = compact(await Promise.all(examples.map(async (example) => (
    !(await determineExampleCompleteness(example)).completeExampleRequirements.length)))).length;
  return sufficientExamplesCount;
};

/* Returns all the Examples that are on the platform */
export const getExampleStats = async (
  _: Request,
  res: Response,
  next: NextFunction,
) : Promise<Response | void> => {
  try {
    const examples = await Example
      .find({
        $and: [
          { $expr: { $gt: [{ $strLenCP: '$igbo' }, 3] } },
          { $expr: { $gte: ['$english', '$igbo'] } },
          { 'associatedWords.0': { $exists: true } },
        ],
      });
    const sufficientExamplesCount = examples.length;
    const completedExamplesCount = await countCompletedExamples(examples);
    return res.send({ sufficientExamplesCount, completedExamplesCount });
  } catch (err) {
    return next(err);
  }
};

export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req;
    const wordSuggestions = await WordSuggestion.find({}).lean();
    const exampleSuggestions = await ExampleSuggestion.find({}).lean();

    const approvedWordSuggestionsCount = wordSuggestions.filter(({ approvals }) => approvals.includes(user.uid)).length;
    const deniedWordSuggestionsCount = wordSuggestions.filter(({ denials }) => denials.includes(user.uid)).length;
    const approvedExampleSuggestionsCount = exampleSuggestions
      .filter(({ approvals }) => approvals.includes(user.uid)).length;
    const deniedExampleSuggestionsCount = exampleSuggestions.filter(({ denials }) => denials.includes(user.uid)).length;
    const authoredWordSuggestionsCount = wordSuggestions.filter(({ author }) => author === user.uid).length;
    const authoredExampleSuggestionsCount = exampleSuggestions.filter(({ author }) => author === user.uid).length;
    const mergedWordSuggestionsCount = wordSuggestions.filter(({ mergedBy }) => mergedBy === user.uid).length;
    const mergedExampleSuggestionsCount = exampleSuggestions.filter(({ mergedBy }) => mergedBy === user.uid).length;

    return res.send({
      approvedWordSuggestionsCount,
      deniedWordSuggestionsCount,
      approvedExampleSuggestionsCount,
      deniedExampleSuggestionsCount,
      authoredWordSuggestionsCount,
      authoredExampleSuggestionsCount,
      mergedWordSuggestionsCount,
      mergedExampleSuggestionsCount,
    });
  } catch (err) {
    return next(err);
  }
};
