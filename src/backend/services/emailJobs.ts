import { compact, flatten } from 'lodash';
import getExampleSuggestionsFromLastWeek from 'src/backend/controllers/exampleSuggestions/helpers/getExampleSuggestionsFromLastWeek';
import getNonMergedExampleSuggestions from 'src/backend/controllers/exampleSuggestions/helpers/getNonMergedExampleSuggestion';
import { connectDatabase, disconnectDatabase } from '../utils/database';
import { findPermittedUserEmails } from '../controllers/users';
import { LOOK_BACK_DATE } from '../shared/constants/emailDates';
import { sendMergedStats, sendSuggestionsReminder } from '../controllers/email';
import { getTotalWordsWithAudioPronunciations, getTotalWordsInStandardIgbo } from '../controllers/words';
import { getWordSuggestionsFromLastWeek, getNonMergedWordSuggestions } from '../controllers/wordSuggestions';

const getMergedWords = async (mongooseConnection) => compact(await getWordSuggestionsFromLastWeek(mongooseConnection));

const getMergedExamples = async (mongooseConnection) =>
  compact(flatten([await getExampleSuggestionsFromLastWeek(mongooseConnection)]));

/**
 * Aggregates data for merged words and examples from the past week and sends
 * an email to all editors, mergers, and admins
 * */
export const sendWeeklyStats = async (): Promise<void> => {
  const mongooseConnection = await connectDatabase();
  try {
    const permittedUserEmails = await findPermittedUserEmails();
    if (permittedUserEmails.length) {
      /* Gets all the merged words and examples to show in email */
      const mergedWords = await getMergedWords(mongooseConnection);
      const mergedExamples = await getMergedExamples(mongooseConnection);
      const wordsWithAudioPronunciations = await getTotalWordsWithAudioPronunciations(mongooseConnection);
      const wordsInStandardIgbo = await getTotalWordsInStandardIgbo(mongooseConnection);
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
      await disconnectDatabase();
    }
  } catch (err) {
    await disconnectDatabase();
  }
};

/* Reminds editors, mergers, and admins that there are suggestion docs remaining for review */
export const onSendEditorReminderEmail = async (): Promise<void> => {
  const mongooseConnection = await connectDatabase();
  try {
    const permittedUserEmails = await findPermittedUserEmails();
    /* Get all non merged word and example suggestion documents */
    const nonMergedWordSuggestions = await getNonMergedWordSuggestions(mongooseConnection);
    const nonMergedExampleSuggestions = await getNonMergedExampleSuggestions(mongooseConnection);
    const totalSuggestionsCount = nonMergedWordSuggestions.length + nonMergedExampleSuggestions.length;
    if (permittedUserEmails.length && totalSuggestionsCount) {
      const emailData = {
        to: permittedUserEmails,
        totalSuggestionsCount,
        wordSuggestionsCount: nonMergedWordSuggestions.length,
        exampleSuggestionsCount: nonMergedExampleSuggestions.length,
      };
      await sendSuggestionsReminder(emailData);
      await disconnectDatabase();
    }
  } catch (err) {
    await disconnectDatabase();
  }
};
