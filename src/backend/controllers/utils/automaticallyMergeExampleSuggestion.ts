import { assign, compact } from 'lodash';
import { Connection } from 'mongoose';
import { sendAudioPronunciationDeletionNotification } from 'src/backend/controllers/email';
import { findUser } from 'src/backend/controllers/users';
import { Example, ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import Author from 'src/backend/shared/constants/Author';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import { executeMergeExample } from '../examples';

const MINIMUM_REVIEWS = 2;

/**
 * Removes the completely denied audio pronunciations
 * @param rawExampleSuggestion
 * @returns A cleaned Example Suggestion with no completely denied audio pronunciations
 */
const removeDeniedAudio = async (rawExampleSuggestion: ExampleSuggestion) => {
  const exampleSuggestion = assign(rawExampleSuggestion);
  exampleSuggestion.pronunciations = compact(
    await Promise.all(
      exampleSuggestion.pronunciations.map(async (pronunciation) => {
        const { review, audio, denials } = pronunciation;
        if (review && audio && denials.length >= MINIMUM_REVIEWS) {
          try {
            const audioRecorderEmail = (await findUser(pronunciation.speaker))?.email;
            if (audioRecorderEmail) {
              const deniersEmails = compact(
                await Promise.all(denials.map(async (denial) => (await findUser(denial))?.email)),
              );
              const data = {
                to: audioRecorderEmail,
                firstDenierEmail: deniersEmails[0],
                secondDenierEmail: deniersEmails[1],
                example: rawExampleSuggestion,
                deletedAudioPronunciation: audio,
              };
              // Sends email to audio recorder whose audio is deleted
              await sendAudioPronunciationDeletionNotification(data);
            }
          } catch (err) {
            console.log(err);
            console.error('Unable to send audio pronunciation deletion notification email');
          }

          // Removes the reference to the audio pronunciation
          return null;
        }
        return pronunciation;
      }),
    ),
  );
  return exampleSuggestion;
};

/**
 * Handles automatically merging Example Suggestion that follows the criteria:
 * 1. The Example Suggestion is not a child of an Example document
 * 2. The Example Suggestion is from BBC or Igbo Wikimedia Group
 * 3. The Example Suggestion is sourced from data collection or the Bible
 * 4. Each audio pronunciation has at least 2 approvals or 2 denials
 *    - Audio pronunciations with 2 denials will be automatically deleted
 * @param ({ exampleSuggestion: ExampleSuggestion, mongooseConnection: Connection }) Object that
 * expects an Example Suggestion and Mongoose connection
 * @returns Either the newly merged Example document or null if the Example Suggestion
 * didn't pass the merging criteria
 */
const automaticallyMergeExampleSuggestion = async ({
  exampleSuggestion,
  mongooseConnection,
}: {
  exampleSuggestion: ExampleSuggestion;
  mongooseConnection: Connection;
}): Promise<Example | null> => {
  if (
    !exampleSuggestion.exampleForSuggestion &&
    (exampleSuggestion.source === SuggestionSourceEnum.BBC ||
      exampleSuggestion.source === SuggestionSourceEnum.IGBO_WIKIMEDIANS) &&
    (exampleSuggestion.type === SentenceTypeEnum.DATA_COLLECTION ||
      exampleSuggestion.type === SentenceTypeEnum.BIBLICAL) &&
    exampleSuggestion.pronunciations.every(({ review, audio, approvals, denials }) => {
      if (!review) {
        return true;
      }
      if (review && audio && approvals?.length >= MINIMUM_REVIEWS) {
        return true;
      }
      if (review && audio && denials?.length >= MINIMUM_REVIEWS) {
        return true;
      }
      return false;
    })
  ) {
    const cleanedExampleSuggestion = await removeDeniedAudio(exampleSuggestion);
    const example = await executeMergeExample(cleanedExampleSuggestion, Author.SYSTEM, mongooseConnection);
    return example;
  }
  return null;
};

export default automaticallyMergeExampleSuggestion;
