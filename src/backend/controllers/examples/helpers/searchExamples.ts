import { Connection } from 'mongoose';
import { exampleSchema } from 'src/backend/models/Example';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

/**
 * Uses regex to search for examples with both Igbo and English
 * @param param0
 * @returns Examples
 */
const searchExamples = ({
  query,
  skip,
  limit,
  mongooseConnection,
}: {
  query: RegExp | any;
  skip: number;
  limit: number;
  mongooseConnection: Connection;
}): Promise<Interfaces.Example[]> => {
  const Example = mongooseConnection.model('Example', exampleSchema);
  return Example.find(query).skip(skip).limit(limit);
};

export default searchExamples;
