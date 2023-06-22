import { Response, NextFunction } from 'express';
import { times } from 'lodash';
import moment from 'moment';
import { exampleSchema } from '../models/Example';
import { wordSchema } from '../models/Word';
import { wordSuggestionSchema } from '../models/WordSuggestion';
import { exampleSuggestionSchema } from '../models/ExampleSuggestion';
import { statSchema } from '../models/Stat';
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
import { connectDatabase, disconnectDatabase } from '../utils/database';
import ExampleStyle from '../shared/constants/ExampleStyle';
import SentenceType from '../shared/constants/SentenceType';
import { countAllAudio } from './utils/MediaAPIs/AudioAPI';
import Author from '../shared/constants/Author';

const WORD_SUGGESTION_QUERY_LIMIT = 3000;
const EXAMPLE_SUGGESTION_QUERY_LIMIT = 5000;
const findStat = async ({ type, authorId = Author.SYSTEM, Stat }) => {
  let stat = await Stat.findOne({ type, authorId });
  if (!stat) {
    // The stat hasn't been created, let's create a new one
    const newState = new Stat({ type, authorId });
    stat = newState.save();
  }
  return stat;
};

const updateStat = async ({ type, authorId = Author.SYSTEM, value, Stat }) => {
  if (!value && typeof value !== 'number') {
    throw new Error('Valid truthy valid must be provided');
  }

  const stat = await findStat({ type, authorId, Stat });
  stat.value = value;
  stat.markModified('value');
  return stat.save();
};

/* Returns all the WordSuggestions with Headword audio pronunciations */
const calculateTotalHeadwordsWithAudioPronunciations = async (
  Word,
  Stat,
): Promise<{ audioPronunciationWords: number } | void> => {
  const audioPronunciationWords = await Word.countDocuments(searchForAllWordsWithAudioPronunciations());
  await updateStat({ type: StatTypes.HEADWORD_AUDIO_PRONUNCIATIONS, value: audioPronunciationWords, Stat });
  return { audioPronunciationWords };
};

/* Returns all the Words that's in Standard Igbo */
const calculateTotalWordsInStandardIgbo = async (Word, Stat): Promise<{ isStandardIgboWords: number } | void> => {
  const isStandardIgboWords = await Word.countDocuments(searchForAllWordsWithIsStandardIgbo());
  await updateStat({ type: StatTypes.STANDARD_IGBO, value: isStandardIgboWords, Stat });
  return { isStandardIgboWords };
};

/* Returns all Words with Nsịbịdị */
const calculateTotalWordsWithNsibidi = async (Word, Stat): Promise<{ wordsWithNsibidi: number } | void> => {
  const wordsWithNsibidi = await Word.countDocuments(searchForAllWordsWithNsibidi());
  await updateStat({ type: StatTypes.NSIBIDI_WORDS, value: wordsWithNsibidi, Stat });

  return { wordsWithNsibidi };
};

/* Returns all Word Suggestions with Nsịbịdị */
const calculateTotalWordSuggestionsWithNsibidi = async (
  WordSuggestion,
  Stat,
): Promise<{ wordSuggestionsWithNsibidi: number } | void> => {
  const wordSuggestionsWithNsibidi = await WordSuggestion.countDocuments({
    ...searchForAllWordsWithNsibidi(),
    merged: null,
  });
  await updateStat({ type: StatTypes.NSIBIDI_WORD_SUGGESTIONS, value: wordSuggestionsWithNsibidi, Stat });
  return { wordSuggestionsWithNsibidi };
};

const countWords = async (words) => {
  let sufficientWordsCount = 0;
  let completeWordsCount = 0;
  let dialectalVariationsCount = 0;
  let igboDefinitionsCount = 0;
  await Promise.all(
    words.map(async (word) => {
      const isAsCompleteAsPossible = determineIsAsCompleteAsPossible(word);
      const { sufficientWordRequirements, completeWordRequirements } = await determineDocumentCompleteness(word, true);
      const manualCheck = word.isComplete && isAsCompleteAsPossible;
      // Tracks total sufficient words
      const isSufficientWord = !sufficientWordRequirements.length;
      if (isSufficientWord) {
        sufficientWordsCount += 1;
      }
      // Tracks total complete words
      const isCompleteWord =
        manualCheck ||
        !completeWordRequirements.length ||
        (completeWordRequirements.length === 1 && completeWordRequirements.includes('The headword is needed'));
      if (isCompleteWord) {
        completeWordsCount += 1;
      }
      // Tracks total dialectal variations
      dialectalVariationsCount += (word.dialects || []).length + 1;

      // Tracks total documents with Igbo definitions
      igboDefinitionsCount += word.definitions.find(({ igboDefinitions = [] }) => igboDefinitions.length) ? 1 : 0;
    }),
  );

  return {
    sufficientWordsCount,
    completeWordsCount,
    dialectalVariationsCount,
    igboDefinitionsCount,
  };
};

/* Returns all the Words that are "sufficient" */
const calculateWordStats = async (
  Word,
  Stat,
): Promise<{
  sufficientWordsCount: number;
  completeWordsCount: number;
  dialectalVariationsCount: number;
  igboDefinitionsCount: number;
} | void> => {
  const INCLUDE_ALL_WORDS_LIMIT = 100000;
  const words = await findWordsWithMatch({
    match: { 'attributes.isStandardIgbo': { $eq: true } },
    examples: true,
    limit: INCLUDE_ALL_WORDS_LIMIT,
    Word,
  });
  const { sufficientWordsCount, completeWordsCount, dialectalVariationsCount, igboDefinitionsCount } = await countWords(
    words,
  );
  await updateStat({ type: StatTypes.SUFFICIENT_WORDS, value: sufficientWordsCount, Stat });
  await updateStat({ type: StatTypes.COMPLETE_WORDS, value: completeWordsCount, Stat });
  await updateStat({ type: StatTypes.DIALECTAL_VARIATIONS, value: dialectalVariationsCount, Stat });
  await updateStat({ type: StatTypes.IGBO_DEFINITIONS, value: igboDefinitionsCount, Stat });

  return {
    sufficientWordsCount,
    completeWordsCount,
    dialectalVariationsCount,
    igboDefinitionsCount,
  };
};

const countExampleStats = async (examples: Interfaces.Example[]) => {
  let sufficientExamplesCount = 0;
  let completedExamplesCount = 0;
  let proverbExamplesCount = 0;
  let biblicalExamplesCount = 0;
  await Promise.all(
    examples.map(async (example) => {
      const isExampleSufficient = !!example.associatedWords?.[0];
      const isExampleComplete = !(await determineExampleCompleteness(example, true)).completeExampleRequirements.length;
      const isExampleProverb = example.style === ExampleStyle.PROVERB.value;
      const isExampleBiblical = example.style === ExampleStyle.BIBLICAL.value || example.type === SentenceType.BIBLICAL;
      sufficientExamplesCount += isExampleSufficient ? 1 : 0;
      completedExamplesCount += isExampleComplete ? 1 : 0;
      proverbExamplesCount += isExampleProverb ? 1 : 0;
      biblicalExamplesCount += isExampleBiblical ? 1 : 0;
    }),
  );
  return {
    sufficientExamplesCount,
    completedExamplesCount,
    proverbExamplesCount,
    biblicalExamplesCount,
  };
};

/* Returns all the Examples that are on the platform */
const calculateExampleStats = async (
  Example,
  Stat,
): Promise<{ sufficientExamplesCount: number; completedExamplesCount: number } | void> => {
  const examples = await Example.find({
    $and: [{ $expr: { $gt: [{ $strLenCP: '$igbo' }, 3] } }],
  });

  const { sufficientExamplesCount, completedExamplesCount, proverbExamplesCount, biblicalExamplesCount } =
    await countExampleStats(examples);
  await updateStat({ type: StatTypes.SUFFICIENT_EXAMPLES, value: sufficientExamplesCount, Stat });
  await updateStat({ type: StatTypes.COMPLETE_EXAMPLES, value: completedExamplesCount, Stat });
  await updateStat({ type: StatTypes.PROVERB_EXAMPLES, value: proverbExamplesCount, Stat });
  await updateStat({ type: StatTypes.BIBLICAL_EXAMPLES, value: biblicalExamplesCount, Stat });

  return { sufficientExamplesCount, completedExamplesCount };
};

export const getUserStats = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const {
      user,
      params: { uid },
      mongooseConnection,
    } = req;
    const userId = uid || user.uid;
    const WordSuggestion = mongooseConnection.model('WordSuggestion', wordSuggestionSchema);
    const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
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
    const approvedExampleSuggestionsCount = exampleSuggestions.filter(({ approvals }) =>
      approvals.includes(userId),
    ).length;
    const deniedExampleSuggestionsCount = exampleSuggestions.filter(({ denials }) => denials.includes(userId)).length;

    // Authored documents
    const authoredWordSuggestionsCount = wordSuggestions.filter(({ author }) => author === userId).length;
    const authoredExampleSuggestionsCount = exampleSuggestions.filter(({ author }) => author === userId).length;

    // Merged documents
    const mergedWordSuggestionsCount = wordSuggestions.filter(
      ({ authorId, mergedBy }) => authorId === userId && mergedBy,
    ).length;
    const mergedExampleSuggestionsCount = exampleSuggestions.filter(
      ({ authorId, mergedBy }) => authorId === userId && mergedBy,
    ).length;

    // Merged by the user documents
    const mergedByUserWordSuggestionsCount = wordSuggestions.filter(({ mergedBy }) => mergedBy === userId).length;
    const mergedByUserExampleSuggestionsCount = exampleSuggestions.filter(({ mergedBy }) => mergedBy === userId).length;

    // Interacted with documents
    const currentEditingWordSuggestionsCount = wordSuggestions.filter(
      ({ mergedBy, userInteractions = [] }) => !mergedBy && userInteractions.includes(userId),
    ).length;
    const currentEditingExampleSuggestionsCount = exampleSuggestions.filter(
      ({ mergedBy, userInteractions = [] }) => !mergedBy && userInteractions.includes(userId),
    ).length;

    return res.send({
      approvedWordSuggestionsCount,
      deniedWordSuggestionsCount,
      approvedExampleSuggestionsCount,
      deniedExampleSuggestionsCount,
      authoredWordSuggestionsCount,
      authoredExampleSuggestionsCount,
      mergedWordSuggestionsCount,
      mergedExampleSuggestionsCount,
      mergedByUserWordSuggestionsCount,
      mergedByUserExampleSuggestionsCount,
      currentEditingWordSuggestionsCount,
      currentEditingExampleSuggestionsCount,
    });
  } catch (err) {
    return next(err);
  }
};

export const getUserMergeStats = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const {
      params: { uid },
      mongooseConnection,
    } = req;
    const TWELVE_WEEKS = 12;
    const threeMonthsAgo = new Date(
      moment()
        .subtract(TWELVE_WEEKS - 1, 'weeks')
        .startOf('week')
        .toISOString(),
    );
    const WordSuggestion = mongooseConnection.model('WordSuggestion', wordSuggestionSchema);
    const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
    console.time(`Querying user merge stat example suggestions for ${uid}`);
    const exampleSuggestions = (await ExampleSuggestion.find({
      authorId: uid,
      mergedBy: { $ne: null },
      updatedAt: { $gt: threeMonthsAgo },
    })
      .hint('Merged example suggestion index')
      .limit(EXAMPLE_SUGGESTION_QUERY_LIMIT)) as Interfaces.ExampleSuggestion[];
    console.timeEnd(`Querying user merge stat example suggestions for ${uid}`);
    console.time(`Querying user merge stat word suggestions for ${uid}`);
    const wordSuggestions = (await WordSuggestion.find({
      mergedBy: { $ne: null },
      'dialects.editor': uid,
      updatedAt: { $gt: threeMonthsAgo },
    })
      .hint('Merged word suggestion index')
      .limit(WORD_SUGGESTION_QUERY_LIMIT)) as Interfaces.WordSuggestion[];
    console.timeEnd(`Querying user merge stat word suggestions for ${uid}`);
    const defaultMerges = {};
    const isoWeekToDateMap = {};
    times(TWELVE_WEEKS, (index) => {
      const weekDate = moment().subtract(index, 'weeks').startOf('week');

      const week = weekDate.toISOString();
      const isoWeek = weekDate.isoWeek();
      defaultMerges[week] = 0;
      isoWeekToDateMap[isoWeek] = week;
    });
    const currentMonthMerges = {
      exampleSuggestions: 0,
      dialectalVariations: 0,
    };
    console.time(`Example suggestion merge creation for ${uid}`);
    const exampleSuggestionMerges = exampleSuggestions.reduce(
      (finalData, exampleSuggestion) => {
        const exampleSuggestionUpdateDate = moment(exampleSuggestion.updatedAt);
        const exampleSuggestionUpdateIsoWeek = exampleSuggestionUpdateDate.startOf('week').isoWeek();
        const dateOfIsoWeek = isoWeekToDateMap[exampleSuggestionUpdateIsoWeek];
        const isSameMonth =
          moment().isSame(exampleSuggestionUpdateDate, 'month') ||
          moment().isSame(exampleSuggestion.updatedAt, 'month');
        if (isSameMonth) {
          currentMonthMerges.exampleSuggestions += 1;
        }
        if (dateOfIsoWeek) {
          finalData[dateOfIsoWeek] += 1;
        } else {
          console.log(
            'No dateOfIsoWeek found for the following exampleSuggestion timestamp:',
            exampleSuggestion.updatedAt,
            exampleSuggestionUpdateIsoWeek,
          );
        }
        return finalData;
      },
      { ...defaultMerges },
    );
    console.timeEnd(`Example suggestion merge creation for ${uid}`);
    console.time(`Dialectal variation merge creation for ${uid}`);
    const dialectalVariationMerges = wordSuggestions.reduce(
      (finalData, wordSuggestion) => {
        const wordSuggestionUpdateDate = moment(wordSuggestion.updatedAt);
        const wordSuggestionUpdateIsoWeek = wordSuggestionUpdateDate.startOf('week').isoWeek();
        const dateOfIsoWeek = isoWeekToDateMap[wordSuggestionUpdateIsoWeek];
        const isSameMonth =
          moment().isSame(wordSuggestionUpdateDate, 'month') || moment().isSame(wordSuggestion.updatedAt, 'month');
        const countedHeadword = !wordSuggestion.originalWordId && wordSuggestion.authorId === uid ? 1 : 0;
        const dialectEditorCount = wordSuggestion.dialects.filter(({ editor }) => editor === uid).length;
        if (isSameMonth) {
          currentMonthMerges.dialectalVariations += countedHeadword + dialectEditorCount;
        }
        if (dateOfIsoWeek) {
          finalData[dateOfIsoWeek] += countedHeadword + dialectEditorCount;
        } else {
          console.log(
            'No dateOfIsoWeek found for the following wordSuggestion timestamp:',
            wordSuggestion.updatedAt,
            wordSuggestionUpdateIsoWeek,
          );
        }
        return finalData;
      },
      { ...defaultMerges },
    );
    console.timeEnd(`Dialectal variation merge creation for ${uid}`);

    return res.send({ exampleSuggestionMerges, dialectalVariationMerges, currentMonthMerges });
  } catch (err) {
    return next(err);
  }
};

/* Gets all stats for the entire platform */
export const getStats = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const Stat = mongooseConnection.model('Stat', statSchema);

    const stats = await Stat.find({ type: { $in: Object.values(StatTypes) } }).hint({ type: 1 });
    return res.send(
      stats.reduce(
        (finalObject, stat) => ({
          ...finalObject,
          [stat.type]: stat,
        }),
        {},
      ),
    );
  } catch (err) {
    return next(err);
  }
};

export const onUpdateDashboardStats = async (): Promise<void> => {
  const connection = await connectDatabase();
  try {
    const Word = connection.model('Word', wordSchema);
    const Example = connection.model('Example', exampleSchema);
    const WordSuggestion = connection.model('WordSuggestion', wordSuggestionSchema);
    const Stat = connection.model('Stat', statSchema);

    await Promise.all([
      calculateExampleStats(Example, Stat),
      calculateTotalWordSuggestionsWithNsibidi(WordSuggestion, Stat),
      calculateTotalWordsWithNsibidi(Word, Stat),
      calculateTotalWordsInStandardIgbo(Word, Stat),
      calculateTotalHeadwordsWithAudioPronunciations(Word, Stat),
      calculateWordStats(Word, Stat),
    ]);
    await disconnectDatabase();
  } catch (err) {
    await disconnectDatabase();
    console.log(err);
  }
};

/**
 * Counts all audio in the S3 bucket
 * @param req
 * @param res
 * @returns
 */
export const getTotalAudioCount = async (req: Interfaces.EditorRequest, res: Response): Promise<Response | void> => {
  const minutes = await countAllAudio();
  const hours = minutes / 60;
  return res.send({ minutes, hours });
};
