import { Connection } from 'mongoose';
import { Example, ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import { executeMergeExample } from '../examples';

const MINIMUM_APPROVALS = 2;

/**
 * Handles automatically merging Example Suggestion that follows the criteria
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
    exampleSuggestion.approvals.length >= MINIMUM_APPROVALS &&
    exampleSuggestion.pronunciations.every(({ review, audio, approvals }) => {
      if (!review) {
        return true;
      }
      return review && audio && approvals.length >= MINIMUM_APPROVALS;
    })
  ) {
    const example = await executeMergeExample(exampleSuggestion, 'SYSTEM', mongooseConnection);
    return example;
  }
  return null;
};

export default automaticallyMergeExampleSuggestion;
