import { Connection } from 'mongoose';
import createExample from 'src/backend/controllers/examples/helpers/createExample';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { updateDocumentMerge } from 'src/backend/controllers/utils';

/**
 * Creates a new Example document from an existing Example Suggestion document
 * @param exampleSuggestion
 * @param mergedBy
 * @param mongooseConnection
 * @returns
 */
const createExampleFromSuggestion = async (
  exampleSuggestion: Interfaces.ExampleSuggestion,
  mergedBy: string,
  mongooseConnection: Connection,
): Promise<Interfaces.Example> => {
  const example = await createExample(exampleSuggestion.toObject() as Interfaces.ExampleClientData, mongooseConnection)
    .then(async (example: Interfaces.Example) => {
      const updatedExampleSuggestion = await updateDocumentMerge(exampleSuggestion, example.id.toString(), mergedBy);
      await updatedExampleSuggestion.save();
      return example;
    })
    .catch((error) => {
      throw new Error(`An error occurred while saving the new example: ${error.message}`);
    });
  return example;
};

export default createExampleFromSuggestion;
