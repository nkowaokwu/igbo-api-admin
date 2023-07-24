import { v4 as uuidv4 } from 'uuid';
import handleCreatingNewExampleSuggestions from 'src/backend/controllers/exampleSuggestions/helpers/handleCreatingNewExampleSuggestions';
import { searchExamplesWithoutEnoughAudioRegexQuery } from 'src/backend/controllers/utils/queries';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import { createExample, suggestNewExample } from 'src/__tests__/shared/commands';
import { AUTH_TOKEN } from 'src/__tests__/shared/constants';
import { exampleSuggestionData } from 'src/__tests__/__mocks__/documentData';
import { connectDatabase, disconnectDatabase } from 'src/backend/utils/database';
import { times } from 'lodash';

describe('handleCreatingNewExampleSuggestions', () => {
  beforeEach(async () => {
    // Clear out database to start with a clean slate
    await dropMongoDBCollections();
  });
  it('creates five brand new example suggestions', async () => {
    const mongooseConnection = await connectDatabase();
    const query = searchExamplesWithoutEnoughAudioRegexQuery(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
    const exampleSuggestions = await handleCreatingNewExampleSuggestions({
      query,
      skip: 0,
      limit: 5,
      mongooseConnection,
    });

    exampleSuggestions.forEach((exampleSuggestion) => {
      expect(exampleSuggestion.originalExampleId).toBeFalsy();
    });

    await disconnectDatabase();
  });

  it('creates at least one example suggestion from one example', async () => {
    const mongooseConnection = await connectDatabase();
    const query = searchExamplesWithoutEnoughAudioRegexQuery(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
    const exampleSuggestionRes = await suggestNewExample(exampleSuggestionData);
    expect(exampleSuggestionRes.status).toEqual(200);
    const exampleRes = await createExample(exampleSuggestionRes.body.id);
    expect(exampleRes.status).toEqual(200);

    const exampleSuggestions = await handleCreatingNewExampleSuggestions({
      query,
      skip: 0,
      limit: 5,
      mongooseConnection,
    });

    expect(
      exampleSuggestions.filter(
        ({ originalExampleId }) => originalExampleId.toString() === exampleRes.body.id.toString(),
      ),
    ).toHaveLength(1);
    expect(exampleSuggestions).toHaveLength(1);
    await disconnectDatabase();
  });

  it("doesn't create any new example suggestions because there are at least five examples", async () => {
    const mongooseConnection = await connectDatabase();
    const query = searchExamplesWithoutEnoughAudioRegexQuery(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
    const exampleIds = await Promise.all(
      times(5, async () => {
        const exampleSuggestionRes = await suggestNewExample({
          ...exampleSuggestionData,
          igbo: uuidv4(),
        });
        expect(exampleSuggestionRes.status).toEqual(200);
        const exampleRes = await createExample(exampleSuggestionRes.body.id);
        expect(exampleRes.status).toEqual(200);
        return exampleRes.body.id.toString();
      }),
    );

    const exampleSuggestions = await handleCreatingNewExampleSuggestions({
      query,
      skip: 0,
      limit: 5,
      mongooseConnection,
    });

    exampleIds.forEach((id) => {
      expect(exampleSuggestions.find(({ originalExampleId }) => originalExampleId.toString() === id)).toBeTruthy();
    });
    expect(exampleSuggestions).toHaveLength(5);
    await disconnectDatabase();
  });
});
