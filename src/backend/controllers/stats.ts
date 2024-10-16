import { Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { compact } from 'lodash';
import { audioPronunciationSchema } from 'src/backend/models/AudioPronunciation';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import { IGBO_API_PROJECT_ID } from 'src/backend/config';
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
import SentenceTypeEnum from '../shared/constants/SentenceTypeEnum';
import Author from '../shared/constants/Author';

const BYTES_TO_SECONDS = 43800;

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
  const audioPronunciationWords = await Word.countDocuments(
    searchForAllWordsWithAudioPronunciations({ projectId: IGBO_API_PROJECT_ID }),
  );
  await updateStat({ type: StatTypes.HEADWORD_AUDIO_PRONUNCIATIONS, value: audioPronunciationWords, Stat });
  return { audioPronunciationWords };
};

/* Returns all the Words that's in Standard Igbo */
const calculateTotalWordsInStandardIgbo = async (Word, Stat): Promise<{ isStandardIgboWords: number } | void> => {
  const isStandardIgboWords = await Word.countDocuments(
    searchForAllWordsWithIsStandardIgbo({ projectId: IGBO_API_PROJECT_ID }),
  );
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

/**
 * Calculates the total amount of example audio hours
 * @param Example
 * @param AudioPronunciation
 * @param Stat
 */
const calculateTotalExampleAudioState = async (
  Example: Model<Interfaces.Example, any, any>,
  AudioPronunciation: Model<Interfaces.AudioPronunciation, any, any>,
  Stat: Model<Interfaces.Stat, any, any>,
): Promise<{ totalExampleAudio: number }> => {
  const examples = await Example.find({ 'pronunciations.audio': { $exists: true } });
  const audioPronunciationPaths = examples.reduce((finalAudioPronunciations, example) => {
    // Get audio-pronunciations/id from the URI
    const pronunciations = compact(example.pronunciations.map(({ audio }) => audio.split(/.com\//)[1]));
    return finalAudioPronunciations.concat(pronunciations);
  }, [] as string[]);

  const audioPronunciations = await AudioPronunciation.find({ objectId: { $in: audioPronunciationPaths } });
  const totalBytes = audioPronunciations.reduce(
    (finalTotalBytes, audioPronunciation) => finalTotalBytes + audioPronunciation.size,
    0,
  );
  const durationInHours = totalBytes / BYTES_TO_SECONDS / 3600;
  await updateStat({ type: StatTypes.TOTAL_EXAMPLE_AUDIO, value: durationInHours, Stat });
  return { totalExampleAudio: durationInHours };
};

/**
 * Calculates the total amount of example suggestion audio hours
 * @param Example
 * @param AudioPronunciation
 * @param Stat
 */
const calculateTotalExampleSuggestionAudioState = async (
  ExampleSuggestion: Model<Interfaces.ExampleSuggestion, any, any>,
  AudioPronunciation: Model<Interfaces.AudioPronunciation, any, any>,
  Stat: Model<Interfaces.Stat, any, any>,
): Promise<{ totalExampleSuggestionAudio: number }> => {
  const exampleSuggestions = await ExampleSuggestion.find({ 'pronunciations.review': { $eq: true } });

  const audioPronunciationPaths = exampleSuggestions.reduce((finalAudioPronunciations, example) => {
    // Get audio-pronunciations/id from the URI that are still under review
    const pronunciations = compact(
      example.pronunciations.map(({ audio, review }) => review && audio.split(/.com\//)[1]),
    );
    return finalAudioPronunciations.concat(pronunciations);
  }, [] as string[]);

  const audioPronunciations = await AudioPronunciation.find({ objectId: { $in: audioPronunciationPaths } });
  const totalBytes = audioPronunciations.reduce(
    (finalTotalBytes, audioPronunciation) => finalTotalBytes + audioPronunciation.size,
    0,
  );
  const durationInHours = totalBytes / BYTES_TO_SECONDS / 3600;
  await updateStat({ type: StatTypes.TOTAL_EXAMPLE_SUGGESTION_AUDIO, value: durationInHours, Stat });
  return { totalExampleSuggestionAudio: durationInHours };
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
      const isExampleProverb = example.style === ExampleStyle[ExampleStyleEnum.PROVERB].value;
      const isExampleBiblical =
        example.style === ExampleStyle[ExampleStyleEnum.BIBLICAL].value || example.type === SentenceTypeEnum.BIBLICAL;
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
    const { projectId } = req.query;
    const userId = uid || user.uid;
    const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );
    const [wordSuggestions, exampleSuggestions] = await Promise.all([
      WordSuggestion.find({
        $or: [
          { author: userId },
          { approvals: { $in: [userId] } },
          { denials: { $in: [userId] } },
          { mergedBy: userId },
          { userInteractions: { $in: [userId] } },
        ],
        projectId,
      }),
      ExampleSuggestion.find({
        $or: [
          { author: userId },
          { approvals: { $in: [userId] } },
          { denials: { $in: [userId] } },
          { mergedBy: userId },
          { userInteractions: { $in: [userId] } },
        ],
        projectId,
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

/* Gets all stats for the entire platform */
export const getStats = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ [key in StatTypes]: { value: number } }> | void> => {
  try {
    const { mongooseConnection } = req;
    const Stat = mongooseConnection.model<Interfaces.Stat>('Stat', statSchema);

    const stats = await Stat.find({ type: { $in: Object.values(StatTypes) } });
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

/**
 * Calculates all relevant stats on the dashboard page
 */
export const onUpdateDashboardStats = async (): Promise<void> => {
  const connection = await connectDatabase();
  try {
    const Word = connection.model<Interfaces.Word>('Word', wordSchema);
    const Example = connection.model<Interfaces.Example>('Example', exampleSchema);
    const WordSuggestion = connection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
    const Stat = connection.model<Interfaces.Stat>('Stat', statSchema);

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
  }
};

/**
 * Calculates the total number of audio hours
 */
export const onUpdateTotalAudioDashboardStats = async (): Promise<
  [{ totalExampleAudio: number }, { totalExampleSuggestionAudio: number }]
> => {
  const connection = await connectDatabase();
  try {
    const Example = connection.model<Interfaces.Example>('Example', exampleSchema);
    const ExampleSuggestion = connection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );
    const AudioPronunciation = connection.model<Interfaces.AudioPronunciation>(
      'AudioPronunciation',
      audioPronunciationSchema,
    );
    const Stat = connection.model<Interfaces.Stat>('Stat', statSchema);
    const result = await Promise.all([
      calculateTotalExampleAudioState(Example, AudioPronunciation, Stat),
      calculateTotalExampleSuggestionAudioState(ExampleSuggestion, AudioPronunciation, Stat),
    ]);
    await disconnectDatabase();
    return result;
  } catch (err) {
    await disconnectDatabase();
    return null;
  }
};

export const getLoginStats = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<any> | void> => {
  const { mongooseConnection } = req;
  try {
    const Stat = mongooseConnection.model<Interfaces.Stat>('Stat', statSchema);
    const [exampleAudioStat, exampleSuggestionAudioStat, totalUsers] = await Promise.all([
      Stat.findOne({ type: StatTypes.TOTAL_EXAMPLE_AUDIO }),
      Stat.findOne({ type: StatTypes.TOTAL_EXAMPLE_SUGGESTION_AUDIO }),
      Stat.findOne({ type: StatTypes.TOTAL_USERS }),
    ]);
    return res.send({
      hours: (exampleAudioStat?.value ?? 0) + (exampleSuggestionAudioStat?.value ?? 0),
      volunteers: totalUsers?.value ?? 0,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Increases the total user stat by one
 * @returns
 */
export const incrementTotalUserStat = async (): Promise<any> => {
  try {
    const connection = await connectDatabase();
    const Stat = connection.model<Interfaces.Stat>('Stat', statSchema);
    const stat = await Stat.findOne({ type: StatTypes.TOTAL_USERS });
    if (!stat) {
      return null;
    }
    stat.value = (stat?.value ?? 0) + 1;
    const savedStat = await stat.save();
    await disconnectDatabase();
    return savedStat;
  } catch (err) {
    await disconnectDatabase();
    return null;
  }
};

/**
 * Decreases the total user stat by one
 * @returns
 */
export const decrementTotalUserStat = async (): Promise<any> => {
  try {
    const connection = await connectDatabase();
    const Stat = connection.model<Interfaces.Stat>('Stat', statSchema);
    const stat = await Stat.findOne({ type: StatTypes.TOTAL_USERS });
    if (!stat) {
      // console.log('There is no total user stat');
      return null;
    }
    stat.value = stat?.value === 0 ? 0 : (stat?.value ?? 0) - 1;
    const savedStat = await stat.save();
    await disconnectDatabase();
    return savedStat;
  } catch (err) {
    await disconnectDatabase();
    return null;
  }
};
