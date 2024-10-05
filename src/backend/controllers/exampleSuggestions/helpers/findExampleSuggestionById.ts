import { Connection } from 'mongoose';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

/**
 * Finds a single Example Suggestion by its Id
 * @param id Id of the Example Suggestion
 * @param mongooseConnection Connection
 * @returns Single Example Suggestion
 */
export const findExampleSuggestionById = async ({
  id,
  projectId,
  mongooseConnection,
}: {
  id: string;
  projectId: string;
  mongooseConnection: Connection;
}): Promise<Interfaces.ExampleSuggestion> => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );
  const exampleSuggestion = await ExampleSuggestion.findOne({ _id: id, projectId });
  return exampleSuggestion;
};

export default findExampleSuggestionById;
