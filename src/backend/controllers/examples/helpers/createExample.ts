import { Connection } from 'mongoose';
import { exampleSchema } from 'src/backend/models/Example';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

/**
 * Create a new Example object in MongoDB
 * @param data
 * @param mongooseConnection
 * @returns Example
 */
const createExample = (
  data: Interfaces.ExampleClientData,
  mongooseConnection: Connection,
): Promise<Interfaces.Example> => {
  const Example = mongooseConnection.model<Interfaces.Example>('Example', exampleSchema);
  const example = new Example(data);
  return example.save();
};

export default createExample;
