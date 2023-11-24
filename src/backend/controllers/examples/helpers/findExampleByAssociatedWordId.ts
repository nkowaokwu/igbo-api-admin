import { Connection, Document, Query } from 'mongoose';
import { exampleSchema } from 'src/backend/models/Example';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

/**
 * Finds an Example by looking the associatedWords field
 * @param id
 * @param mongooseConnection
 * @returns Example
 */
const findExampleByAssociatedWordId = (
  id: string,
  mongooseConnection: Connection,
): Query<Document<Interfaces.Example>[], Document<Interfaces.Example>> => {
  const Example = mongooseConnection.model('Example', exampleSchema);
  return Example.find({ associatedWords: { $in: [id] } });
};

export default findExampleByAssociatedWordId;
