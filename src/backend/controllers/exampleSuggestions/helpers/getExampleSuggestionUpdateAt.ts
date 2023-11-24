import { LeanDocument } from 'mongoose';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

/**
 * Returns the Example Suggestion's date
 * @param exampleSuggestion Example Suggestion
 * @returns Date of Example Suggestion
 */
export const getExampleSuggestionUpdateAt = (exampleSuggestion: LeanDocument<Interfaces.ExampleSuggestion>): string =>
  exampleSuggestion.updatedAt.toISOString
    ? exampleSuggestion.updatedAt.toISOString()
    : exampleSuggestion.updatedAt.toString();

export default getExampleSuggestionUpdateAt;
