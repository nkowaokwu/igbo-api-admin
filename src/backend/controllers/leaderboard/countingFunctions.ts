import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

export const countRecordExampleAudio = ({
  exampleSuggestions,
  uid,
}: {
  exampleSuggestions: Interfaces.ExampleSuggestion[];
  uid: string;
}): number =>
  // Count all individual audio pronunciation recordings
  exampleSuggestions.reduce((finalCount, { pronunciations }) => {
    let currentCount = 0;
    pronunciations.forEach(({ speaker }) => {
      if (speaker === uid) {
        currentCount += 1;
      }
    });
    return finalCount + currentCount;
  }, 0);

export const countVerifyExampleAudio = ({
  exampleSuggestions,
  uid,
}: {
  exampleSuggestions: Interfaces.ExampleSuggestion[];
  uid: string;
}): number =>
  // Count all individual audio pronunciation reviews
  exampleSuggestions.reduce((finalCount, { pronunciations }) => {
    let currentCount = 0;
    pronunciations.forEach(({ approvals, denials }) => {
      if (approvals.includes(uid) || denials.includes(uid)) {
        currentCount += 1;
      }
    });
    return finalCount + currentCount;
  }, 0);

export const countTranslateIgboSentence = ({
  exampleSuggestions,
  uid,
}: {
  exampleSuggestions: Interfaces.ExampleSuggestion[];
  uid: string;
}): number =>
  // Count all individual translated Igbo sentences reviews
  exampleSuggestions.reduce((finalCount, { source, translations, userInteractions }) => {
    let currentCount = 0;
    if (source?.text && translations?.[0]?.text && userInteractions.includes(uid)) {
      currentCount += 1;
    }
    return finalCount + currentCount;
  }, 0);

export default {
  [LeaderboardType.RECORD_EXAMPLE_AUDIO]: countRecordExampleAudio,
  [LeaderboardType.VERIFY_EXAMPLE_AUDIO]: countVerifyExampleAudio,
  [LeaderboardType.TRANSLATE_IGBO_SENTENCE]: countTranslateIgboSentence,
};
