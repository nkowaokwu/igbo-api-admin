import { Connection, Document, Query } from 'mongoose';
import { exampleSuggestionSchema } from '../../../models/ExampleSuggestion';
import * as Interfaces from '../../utils/interfaces';

/**
 * Finds Example Suggestion documents
 * @param ({ query: Object, skip: number, limit: number, mongooseConnection: Connection })
 * @returns Found Example Suggestion documents
 */
const findExampleSuggestions = ({
  query,
  skip = 0,
  limit = 10,
  sort = { updatedAt: -1 },
  mongooseConnection,
}: {
  query: any;
  skip?: number;
  limit?: number;
  sort?: { [key: string]: number };
  mongooseConnection: Connection;
}): Query<any, Document<Interfaces.ExampleSuggestion>> => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );

  return ExampleSuggestion.find(query).skip(skip).limit(limit).sort(sort);
};

export default findExampleSuggestions;
