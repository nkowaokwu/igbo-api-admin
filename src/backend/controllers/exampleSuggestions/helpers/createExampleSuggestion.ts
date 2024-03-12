import { Connection } from 'mongoose';
import { searchPreExistingExampleSuggestionsRegexQuery } from 'src/backend/controllers/utils/queries';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';

/**
 * Creates and saves a new Example Suggestion in the database
 * @param data ExampleClientData
 * @param mongooseConnection Connection
 * @returns Newly created Example Suggestion document
 */
const createExampleSuggestion = async (
  data: Interfaces.ExampleClientData,
  mongooseConnection: Connection,
): Promise<Interfaces.ExampleSuggestion> => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );
  const queryData = { igbo: data.igbo || '' };
  const query = searchPreExistingExampleSuggestionsRegexQuery(queryData);
  const identicalExampleSuggestions = await ExampleSuggestion.find(query);

  if (identicalExampleSuggestions.length) {
    throw new Error(
      'There is an existing Example Suggestion with the same Igbo text. Please edit the existing Example Suggestion',
    );
  }

  const newExampleSuggestion = new ExampleSuggestion(data) as Interfaces.ExampleSuggestion;
  return newExampleSuggestion.save().catch(() => {
    throw new Error('An error has occurred while saving, double check your provided data');
  });
};

export default createExampleSuggestion;
