import { Connection } from 'mongoose';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { searchForLastWeekQuery } from 'src/backend/controllers/utils/queries';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

/**
 * Returns all the ExampleSuggestions from last week
 * @param mongooseConnection
 * @returns
 */
const getExampleSuggestionsFromLastWeek = (mongooseConnection: Connection): Promise<any> => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );

  return ExampleSuggestion.find(searchForLastWeekQuery()).lean().exec();
};

export default getExampleSuggestionsFromLastWeek;
