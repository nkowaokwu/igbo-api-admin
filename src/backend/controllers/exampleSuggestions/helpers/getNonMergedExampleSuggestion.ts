import { Connection } from 'mongoose';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

/**
 * Returns all non-merged Example Suggestions
 * @param mongooseConnection Mongoose Connection
 * @returns Non-merged Example Suggestions (lean)
 */
const getNonMergedExampleSuggestions = (mongooseConnection: Connection): Promise<any> => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );

  return ExampleSuggestion.find({ merged: null, exampleForSuggestion: false }).lean().exec();
};

export default getNonMergedExampleSuggestions;
