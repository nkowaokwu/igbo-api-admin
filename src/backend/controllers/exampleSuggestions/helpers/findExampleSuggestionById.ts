import { Connection, Document, Query } from 'mongoose';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

/**
 * Finds a single Example Suggestion by its Id
 * @param id Id of the Example Suggestion
 * @param mongooseConnection Connection
 * @returns Single Example Suggestion
 */
export const findExampleSuggestionById = (
  id: string,
  mongooseConnection: Connection,
): Query<any, Document<Interfaces.ExampleSuggestion>> => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );
  return ExampleSuggestion.findById(id);
};

export default findExampleSuggestionById;
