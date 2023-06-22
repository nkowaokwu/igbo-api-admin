import { Connection } from 'mongoose';
import { assign, omit } from 'lodash';
import { exampleSuggestionSchema } from '../../../models/ExampleSuggestion';
import * as Interfaces from '../../utils/interfaces';
import { searchExamples } from '../../examples';
import Author from '../../../shared/constants/Author';

const handleCreatingNewExampleSuggestions = async ({
  query,
  skip,
  limit,
  mongooseConnection,
}: {
  query: Record<string, unknown>;
  skip: number;
  limit: number;
  mongooseConnection: Connection;
}): Promise<Interfaces.ExampleSuggestion[]> => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );
  const examples = await searchExamples({ query, skip, limit, mongooseConnection });
  const exampleSuggestionData = examples.map((exampleDoc) => {
    const example = exampleDoc.toJSON();
    return omit(
      {
        ...assign(example),
        exampleForSuggestion: false,
        authorId: Author.SYSTEM, // Tells up the ExampleSuggestion has been automatically generated
        originalExampleId: example.id || example._id,
      },
      ['id'],
    );
  }) as Interfaces.ExampleClientData[];

  // Creates new ExampleSuggestions
  const exampleSuggestions = await Promise.all(
    exampleSuggestionData.map(async (data) => {
      const exampleSuggestion = new ExampleSuggestion(data);
      return exampleSuggestion.save();
    }),
  );
  return exampleSuggestions;
};

export default handleCreatingNewExampleSuggestions;
