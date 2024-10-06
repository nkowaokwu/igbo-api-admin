import { Connection } from 'mongoose';
import { assign, compact, omit } from 'lodash';
import { searchPreExistingExampleSuggestionsRegexQuery } from 'src/backend/controllers/utils/queries';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import searchExamples from 'src/backend/controllers/examples/helpers/searchExamples';
import Author from 'src/backend/shared/constants/Author';

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
  const existingExampleSuggestions = await ExampleSuggestion.find({
    originalExampleId: { $in: examples.map(({ id }) => id.toString()) },
    exampleForSuggestion: false,
    merged: { $eq: null },
  });

  // Filters for Examples without Example Suggestions
  const examplesWithoutSuggestions = examples.reduce((examplesWithoutSuggestions, example) => {
    const exampleSuggestion = existingExampleSuggestions.find(
      ({ originalExampleId }) => example.id?.toString() === originalExampleId?.toString(),
    );
    if (!exampleSuggestion) {
      examplesWithoutSuggestions.push(example);
    }
    return examplesWithoutSuggestions;
  }, [] as Interfaces.Example[]);

  // Creates new Example Suggestions for Example documents that don't have existing children Suggestions
  const exampleSuggestionData = compact(
    await Promise.all(
      examplesWithoutSuggestions.map(async (exampleDoc) => {
        const example = exampleDoc.toJSON();
        const query = searchPreExistingExampleSuggestionsRegexQuery({ text: example?.source?.text || '' });
        const identicalExampleSuggestions = await ExampleSuggestion.find(query);

        if (identicalExampleSuggestions.length) {
          // console.log(`Not automatically creating Example Suggestion from Example: ${example.id}`);
          return null;
        }

        // console.log(`Creating a new Example Suggestion with text: ${example.igbo}`);
        return omit(
          {
            ...assign(example),
            exampleForSuggestion: false,
            authorId: Author.SYSTEM, // Tells up the ExampleSuggestion has been automatically generated
            originalExampleId: example.id || example._id,
          },
          ['id'],
        );
      }),
    ),
  ) as Interfaces.ExampleClientData[];

  // Creates new ExampleSuggestions
  const exampleSuggestions = compact(
    await Promise.all(
      exampleSuggestionData.map(async (data) => {
        try {
          const exampleSuggestion = new ExampleSuggestion(data);
          return await exampleSuggestion.save();
        } catch (err) {
          // console.log(`Unable to create new Example Suggestion: ${err.message}`);
          return null;
        }
      }),
    ),
  );
  const finalExampleSuggestions = existingExampleSuggestions.concat(exampleSuggestions);
  return finalExampleSuggestions.slice(0, limit);
};

export default handleCreatingNewExampleSuggestions;
