import { Connection, Document, Query } from 'mongoose';
import { exampleSchema } from 'src/backend/models/Example';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

/**
 * Finds a single Example by its Id
 * @param id
 * @param mongooseConnection
 * @returns Example
 */
const findExampleById = ({
  id,
  projectId,
  mongooseConnection,
}: {
  id: string;
  projectId;
  mongooseConnection: Connection;
}): Query<Document<Interfaces.Example>, Document<Interfaces.Example>> => {
  const Example = mongooseConnection.model('Example', exampleSchema);
  return Example.findOne({ _id: id, projectId });
};

export default findExampleById;
