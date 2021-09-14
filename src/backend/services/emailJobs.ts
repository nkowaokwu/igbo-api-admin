import * as functions from 'firebase-functions';
import { compact, flatten } from 'lodash';
import { connectDatabase, disconnectDatabase } from '../utils/database';
import { findPermittedUserEmails } from '../controllers/users';
import { LOOK_BACK_DATE } from '../shared/constants/emailDates';
import { sendMergedStats, sendSuggestionsReminder } from '../controllers/email';
import { getTotalWordsWithAudioPronunciations, getTotalWordsInStandardIgbo } from '../controllers/words';
import { getWordSuggestionsFromLastWeek, getNonMergedWordSuggestions } from '../controllers/wordSuggestions';
import { getExampleSuggestionsFromLastWeek, getNonMergedExampleSuggestions } from '../controllers/exampleSuggestions';
import { getGenericWordsFromLastWeek } from '../controllers/genericWords';
import {
  TEST_MONGO_URI,
  LOCAL_MONGO_URI,
  PROD_MONGO_URI,
} from '../config';

const config = functions.config();
const MONGO_URI = config?.runtime?.env === 'cypress' || process.env.NODE_ENV === 'test'
  ? TEST_MONGO_URI
  : config?.runtime?.env === 'development'
    ? LOCAL_MONGO_URI
    : config?.runtime?.env === 'production'
      ? PROD_MONGO_URI
      : LOCAL_MONGO_URI;
connectDatabase(MONGO_URI);

const getMergedWords = async () => (
  compact(flatten([
    await getWordSuggestionsFromLastWeek(),
    await getGenericWordsFromLastWeek(),
  ]))
);

const getMergedExamples = async () => (
  compact(flatten([await getExampleSuggestionsFromLastWeek()]))
);

/**
 * Aggregates data for merged words and examples from the past week and sends
 * an email to all editors, mergers, and admins
 * */
export const sendWeeklyStats = async (): Promise<void> => {
  const permittedUserEmails = await findPermittedUserEmails();
  if (permittedUserEmails.length) {
    /* Gets all the merged words and examples to show in email */
    const mergedWords = await getMergedWords();
    const mergedExamples = await getMergedExamples();
    const wordsWithAudioPronunciations = await getTotalWordsWithAudioPronunciations();
    const wordsInStandardIgbo = await getTotalWordsInStandardIgbo();
    const emailData = {
      to: permittedUserEmails,
      mergedWords: mergedWords.length,
      mergedExamples: mergedExamples.length,
      wordsWithAudioPronunciations: wordsWithAudioPronunciations.length,
      wordsInStandardIgbo: wordsInStandardIgbo.length,
      startDate: new Date(LOOK_BACK_DATE).toDateString(),
      endDate: new Date().toDateString(),
    };
    await sendMergedStats(emailData);
    await disconnectDatabase(MONGO_URI);
  }
};

/* Reminds editors, mergers, and admins that there are suggestion docs remaining for review */
export const onSendEditorReminderEmail = async () => {
  const permittedUserEmails = await findPermittedUserEmails();
  /* Get all non merged word and example suggestion documents */
  const nonMergedWordSuggestions = await getNonMergedWordSuggestions();
  const nonMergedExampleSuggestions = await getNonMergedExampleSuggestions();
  const totalSuggestionsCount = nonMergedWordSuggestions.length + nonMergedExampleSuggestions.length;
  if (permittedUserEmails.length && totalSuggestionsCount) {
    const emailData = {
      to: permittedUserEmails,
      totalSuggestionsCount,
      wordSuggestionsCount: nonMergedWordSuggestions.length,
      exampleSuggestionsCount: nonMergedExampleSuggestions.length,
    };
    await sendSuggestionsReminder(emailData);
    await disconnectDatabase(MONGO_URI);
  }
};
