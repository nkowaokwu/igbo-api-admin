import { Request, Response, NextFunction } from 'express';
import { compact } from 'lodash';
import moment from 'moment';
import Example from '../models/Example';
import Word from '../models/Word';
import WordSuggestion from '../models/WordSuggestion';
import ExampleSuggestion from '../models/ExampleSuggestion';
import Stat from '../models/Stat';
import {
  searchForAllWordsWithAudioPronunciations,
  searchForAllWordsWithIsStandardIgbo,
  searchForAllWordsWithNsibidi,
} from './utils/queries';
import { findWordsWithMatch } from './utils/buildDocs';
import determineDocumentCompleteness from './utils/determineDocumentCompleteness';
import determineExampleCompleteness from './utils/determineExampleCompleteness';
import determineIsAsCompleteAsPossible from './utils/determineIsAsCompleteAsPossible';
import StatTypes from '../shared/constants/StatTypes';
import * as Interfaces from './utils/interfaces';

const WORD_SUGGESTION_QUERY_LIMIT = 3000;
const EXAMPLE_SUGGESTION_QUERY_LIMIT = 5000;
const findStat = async ({ type, authorId = 'SYSTEM' }) => {
  let stat = await Stat.findOne({ type, authorId });
  if (!stat) {
    // The stat hasn't been created, let's create a new one
    const newState = new Stat({ type, authorId });
    stat = newState.save();
  }
  return stat;
};

const updateStat = async ({ type, authorId = 'SYSTEM', value }) => {
  if ((!value && typeof value !== 'number')) {
    throw new Error('Valid truthy valid must be provided');
  }

  const stat = await findStat({ type, authorId });
  stat.value = value;
  stat.markModified('value');
  return stat.save();
};

/* Returns all the WordSuggestions with Headword audio pronunciations */
const calculateTotalHeadwordsWithAudioPronunciations = async ():
Promise<{ audioPronunciationWords: number } | void> => {
  const audioPronunciationWords = await Word
    .countDocuments(searchForAllWordsWithAudioPronunciations());
  await updateStat({ type: StatTypes.HEADWORD_AUDIO_PRONUNCIATIONS, value: audioPronunciationWords });
  return { audioPronunciationWords };
};

/* Returns all the Words that's in Standard Igbo */
const calculateTotalWordsInStandardIgbo = async (): Promise<{ isStandardIgboWords: number } | void> => {
  const isStandardIgboWords = await Word
    .countDocuments(searchForAllWordsWithIsStandardIgbo());
  await updateStat({ type: StatTypes.STANDARD_IGBO, value: isStandardIgboWords });
  return { isStandardIgboWords };
};

/* Returns all Words with Nsịbịdị */
const calculateTotalWordsWithNsibidi = async () : Promise<{ wordsWithNsibidi: number } | void> => {
  const wordsWithNsibidi = await Word
    .countDocuments(searchForAllWordsWithNsibidi());
  await updateStat({ type: StatTypes.NSIBIDI_WORDS, value: wordsWithNsibidi });

  return { wordsWithNsibidi };
};

/* Returns all Word Suggestions with Nsịbịdị */
const calculateTotalWordSuggestionsWithNsibidi = async () : Promise<{ wordSuggestionsWithNsibidi: number } | void> => {
  const wordSuggestionsWithNsibidi = await WordSuggestion
    .countDocuments({ ...searchForAllWordsWithNsibidi(), merged: null });
  await updateStat({ type: StatTypes.NSIBIDI_WORD_SUGGESTIONS, value: wordSuggestionsWithNsibidi });
  return { wordSuggestionsWithNsibidi };
};

const countWords = async (words) => {
  let sufficientWordsCount = 0;
  let completeWordsCount = 0;
  let dialectalVariationsCount = 0;
  await Promise.all(words.map(async (word) => {
    const isAsCompleteAsPossible = determineIsAsCompleteAsPossible(word);
    const { sufficientWordRequirements, completeWordRequirements } = await determineDocumentCompleteness(word, true);
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
const calculateWordStats = async ():
Promise<{ sufficientWordsCount: number, completeWordsCount: number, dialectalVariationsCount: number } | void> => {
  const INCLUDE_ALL_WORDS_LIMIT = 100000;
  const words = await findWordsWithMatch({
    match: {
      word: { $regex: /./ },
      'attributes.isStandardIgbo': { $eq: true },
      'attributes.isAccented': { $eq: true },
    },
    examples: true,
    limit: INCLUDE_ALL_WORDS_LIMIT,
  });
  const { sufficientWordsCount, completeWordsCount, dialectalVariationsCount } = await countWords(words);
  await updateStat({ type: StatTypes.SUFFICIENT_WORDS, value: sufficientWordsCount });
  await updateStat({ type: StatTypes.COMPLETE_WORDS, value: completeWordsCount });
  await updateStat({ type: StatTypes.DIALECTAL_VARIATIONS, value: dialectalVariationsCount });

  return { sufficientWordsCount, completeWordsCount, dialectalVariationsCount };
};

const countCompletedExamples = async (examples) => {
  const sufficientExamplesCount = compact(await Promise.all(examples.map(async (example) => (
    !(await determineExampleCompleteness(example)).completeExampleRequirements.length)))).length;
  return sufficientExamplesCount;
};

/* Returns all the Examples that are on the platform */
const calculateExampleStats = async ():
Promise<{ sufficientExamplesCount: number, completedExamplesCount: number } | void> => {
  const examples = await Example
    .find({
      $and: [
        { $expr: { $gt: [{ $strLenCP: '$igbo' }, 3] } },
        { $expr: { $gte: ['$english', '$igbo'] } },
        { 'associatedWords.0': { $exists: true } },
      ],
    });
  const sufficientExamplesCount = examples.length;
  await updateStat({ type: StatTypes.SUFFICIENT_EXAMPLES, value: sufficientExamplesCount });

  const completedExamplesCount = await countCompletedExamples(examples);
  await updateStat({ type: StatTypes.COMPLETE_EXAMPLES, value: completedExamplesCount });

  return { sufficientExamplesCount, completedExamplesCount };
};

export const getUserStats = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { user, params: { uid } } = req;
    const userId = uid || user.uid;
    const [wordSuggestions, exampleSuggestions] = await Promise.all([
      WordSuggestion.find({
        $or: [
          { author: userId },
          { approvals: { $in: [userId] } },
          { denials: { $in: [userId] } },
          { mergedBy: userId },
          { userInteractions: { $in: [userId] } },
        ],
      }),
      ExampleSuggestion.find({
        $or: [
          { author: userId },
          { approvals: { $in: [userId] } },
          { denials: { $in: [userId] } },
          { mergedBy: userId },
          { userInteractions: { $in: [userId] } },
        ],
      }),
    ]);

    // Approved documents
    const approvedWordSuggestionsCount = wordSuggestions.filter(({ approvals }) => approvals.includes(userId)).length;
    const deniedWordSuggestionsCount = wordSuggestions.filter(({ denials }) => denials.includes(userId)).length;

    // Denied documents
    const approvedExampleSuggestionsCount = exampleSuggestions
      .filter(({ approvals }) => approvals.includes(userId)).length;
    const deniedExampleSuggestionsCount = exampleSuggestions.filter(({ denials }) => denials.includes(userId)).length;

    // Authored documents
    const authoredWordSuggestionsCount = wordSuggestions.filter(({ author }) => author === userId).length;
    const authoredExampleSuggestionsCount = exampleSuggestions.filter(({ author }) => author === userId).length;

    // Merged documents
    const mergedWordSuggestionsCount = wordSuggestions.filter(({ mergedBy }) => mergedBy === userId).length;
    const mergedExampleSuggestionsCount = exampleSuggestions.filter(({ mergedBy }) => mergedBy === userId).length;

    // Interacted with documents
    const currentEditingWordSuggestionsCount = wordSuggestions.filter(({ mergedBy, userInteractions = [] }) => (
      !mergedBy && userInteractions.includes(userId)
    )).length;
    const currentEditingExampleSuggestionsCount = exampleSuggestions.filter(({ mergedBy, userInteractions = [] }) => (
      !mergedBy && userInteractions.includes(userId)
    )).length;

    return res.send({
      approvedWordSuggestionsCount,
      deniedWordSuggestionsCount,
      approvedExampleSuggestionsCount,
      deniedExampleSuggestionsCount,
      authoredWordSuggestionsCount,
      authoredExampleSuggestionsCount,
      mergedWordSuggestionsCount,
      mergedExampleSuggestionsCount,
      currentEditingWordSuggestionsCount,
      currentEditingExampleSuggestionsCount,
    });
  } catch (err) {
    return next(err);
  }
};

export const getUserMergeWordStats = async (
  req: Request, res: Response, next: NextFunction,
): Promise<Response | void> => {
  try {
    const { params: { uid } } = req;
    const userId = uid;
    const threeMonthsAgo = moment().subtract(3, 'months').toDate();
    console.time('Word suggestions merged stats query');
    const wordSuggestions = await WordSuggestion
      .find(
        {
          mergedBy: userId,
          updatedAt: { $gte: threeMonthsAgo },
        },
        'updatedAt',
      )
      .hint({ mergedBy: 1, updatedAt: -1 })
      .limit(WORD_SUGGESTION_QUERY_LIMIT) as Interfaces.WordSuggestion[];
    console.timeEnd('Word suggestions merged stats query');
    console.log('found word suggestions', { wordSuggestions: wordSuggestions.length });
    const wordSuggestionMerges = wordSuggestions.reduce((finalData, wordSuggestion) => {
      const isoWeek = moment(wordSuggestion.updatedAt).isoWeek();
      if (!finalData[isoWeek]) {
        finalData[isoWeek] = 0;
      }
      return {
        ...finalData,
        [isoWeek]: finalData[isoWeek] + 1,
      };
    }, {} as { [key: string]: number });
    return res.send(wordSuggestionMerges);
  } catch (err) {
    return next(err);
  }
};

export const getUserMergeExampleStats = async (
  req: Request, res: Response, next: NextFunction,
): Promise<Response | void> => {
  try {
    const { params: { uid } } = req;
    const userId = uid;
    const threeMonthsAgo = moment().subtract(3, 'months').toDate();
    console.time('Example suggestions merged stats query');
    const exampleSuggestions = await ExampleSuggestion
      .find(
        {
          mergedBy: userId,
          updatedAt: { $gte: threeMonthsAgo },
        },
        'updatedAt',
      )
      .hint({ mergedBy: 1, updatedAt: -1 })
      .limit(EXAMPLE_SUGGESTION_QUERY_LIMIT) as Interfaces.ExampleSuggestion[];
    console.timeEnd('Example suggestions merged stats query');
    const exampleSuggestionMerges = exampleSuggestions.reduce((finalData, exampleSuggestion) => {
      const isoWeek = moment(exampleSuggestion.updatedAt).isoWeek();
      if (!finalData[isoWeek]) {
        finalData[isoWeek] = 0;
      }
      return {
        ...finalData,
        [isoWeek]: finalData[isoWeek] + 1,
      };
    }, {} as { [key: string]: number });
    return res.send(exampleSuggestionMerges);
  } catch (err) {
    return next(err);
  }
};

export const getUserMergeDialectalVariationStats = async (
  req: Request, res: Response, next: NextFunction,
): Promise<Response | void> => {
  try {
    const { params: { uid } } = req;
    const userId = uid;
    const threeMonthsAgo = moment().subtract(3, 'months').toDate();
    console.log('getUserMergeDialectalVariationStats');
    console.time('Dialectal variation merged stats query');
    const dialectalVariationWordSuggestions = await WordSuggestion
      .find(
        {
          mergedBy: userId,
          updatedAt: { $gte: threeMonthsAgo },
          'dialects.editor': userId,
        },
        'dialects updatedAt',
      )
      .hint({ mergedBy: 1, updatedAt: -1, 'dialects.editor': 1 })
      .limit(WORD_SUGGESTION_QUERY_LIMIT) as Interfaces.WordSuggestion[];
    console.timeEnd('Dialectal variation merged stats query');
    console.log(
      'found dialectal variations',
      { dialectalVariationWordSuggestions: dialectalVariationWordSuggestions.length },
    );
    const dialectalVariationMerges = dialectalVariationWordSuggestions.reduce((finalData, wordSuggestion) => {
      const isoWeek = moment(wordSuggestion.updatedAt).isoWeek();
      if (!finalData[isoWeek]) {
        finalData[isoWeek] = 0;
      }
      return {
        ...finalData,
        [isoWeek]: finalData[isoWeek] + wordSuggestion.dialects.filter(({ editor }) => (
          editor === userId
        )).length,
      };
    }, {} as { [key: string]: number });
    return res.send(dialectalVariationMerges);
  } catch (err) {
    return next(err);
  }
};

export const getStats = async (_: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const stats = await Stat.find({ type: { $in: Object.values(StatTypes) } });
    return res.send(stats.reduce((finalObject, stat) => ({
      ...finalObject,
      [stat.type]: stat,
    }), {}));
  } catch (err) {
    return next(err);
  }
};

export const onUpdateDashboardStats = async (): Promise<void> => {
  await Promise.all([
    calculateExampleStats(),
    calculateTotalWordSuggestionsWithNsibidi(),
    calculateTotalWordsWithNsibidi(),
    calculateTotalWordsInStandardIgbo(),
    calculateTotalHeadwordsWithAudioPronunciations(),
    calculateWordStats(),
  ]);
};
