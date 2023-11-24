import getExampleSuggestionUpdateAt from 'src/backend/controllers/exampleSuggestions/helpers/getExampleSuggestionUpdateAt';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { connectDatabase } from 'src/backend/utils/database';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { exampleSuggestionData } from 'src/__tests__/__mocks__/documentData';

it('gets the example suggestion updated at date', async () => {
  const mongooseConnection = await connectDatabase();
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );
  const unsavedExampleSuggestion = new ExampleSuggestion({
    ...exampleSuggestionData,
  });
  const exampleSuggestion = await unsavedExampleSuggestion.save();
  const date = getExampleSuggestionUpdateAt(exampleSuggestion);
  expect(date).toEqual(exampleSuggestion.updatedAt.toISOString());
});
