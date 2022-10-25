import { isEqual, forIn, some } from 'lodash';
import {
  createExample,
  getExamples,
  getExample,
  updateExample,
  suggestNewExample,
  getExampleSuggestion,
  getExampleSuggestions,
} from './shared/commands';
import { AUTH_TOKEN } from './shared/constants';
import {
  exampleData,
  exampleSuggestionData,
  malformedExampleSuggestionData,
  updatedExampleData,
} from './__mocks__/documentData';

describe('MongoDB Examples', () => {
  /* Create a base Example Suggestion document */
  beforeAll(async () => {
    await suggestNewExample(exampleSuggestionData);
  });
  describe('/POST mongodb examples', () => {
    it('should create a new example in the database', async () => {
      const res = await suggestNewExample(exampleSuggestionData);
      expect(res.status).toEqual(200);
      const mergingExampleSuggestion = { ...res.body, ...exampleSuggestionData };
      const result = await createExample(mergingExampleSuggestion.id);
      expect(result.status).toEqual(200);
      expect(result.body.id).not.toEqual(undefined);
      expect(result.body.authorId).toEqual(undefined);
      const updatedExampleRes = await getExample(result.body.id);
      expect(updatedExampleRes.status).toEqual(200);
      const exampleRes = await getExampleSuggestion(res.body.id);
      expect(exampleRes.status).toEqual(200);
      expect(exampleRes.body.mergedBy).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(updatedExampleRes.body.igbo).toEqual(exampleRes.body.igbo);
      expect(updatedExampleRes.body.english).toEqual(exampleRes.body.english);
      expect(updatedExampleRes.body.id).toEqual(exampleRes.body.merged);
    });

    it('should create a new example from existing exampleSuggestion in the database', async () => {
      const res = await getExampleSuggestions();
      expect(res.status).toEqual(200);
      const firstExample = res.body[0];
      const mergingExampleSuggestion = { ...firstExample, ...exampleSuggestionData };
      const result = await createExample(mergingExampleSuggestion.id);
      expect(result.status).toEqual(200);
      expect(result.body.id).not.toEqual(undefined);
      expect(result.body.authorId).toEqual(undefined);
      const updatedExampleRes = await getExample(result.body.id);
      expect(updatedExampleRes.status).toEqual(200);
      const exampleRes = await getExampleSuggestion(firstExample.id);
      expect(exampleRes.status).toEqual(200);
      expect(exampleRes.body.mergedBy).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(updatedExampleRes.body.igbo).toEqual(exampleRes.body.igbo);
      expect(updatedExampleRes.body.english).toEqual(exampleRes.body.english);
      expect(updatedExampleRes.body.id).toEqual(exampleRes.body.merged);
    });

    it('should merge into an existing example', async () => {
      const res = await suggestNewExample(exampleSuggestionData);
      expect(res.status).toEqual(200);
      const examplesRes = await getExamples();
      const firstExample = examplesRes.body[0];
      const mergingExampleSuggestion = { ...res.body, originalExampleId: firstExample.id };
      const result = await createExample(mergingExampleSuggestion.id);
      expect(result.status).toEqual(200);
      expect(result.body.id).not.toEqual(undefined);
      const updatedExampleRes = await getExample(result.body.id);
      expect(updatedExampleRes.status).toEqual(200);
      const exampleRes = await getExampleSuggestion(res.body.id);
      expect(exampleRes.status).toEqual(200);
      expect(exampleRes.body.mergedBy).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(updatedExampleRes.body.igbo).toEqual(exampleRes.body.igbo);
      expect(updatedExampleRes.body.english).toEqual(exampleRes.body.english);
      expect(updatedExampleRes.body.id).toEqual(exampleRes.body.merged);
    });

    it('should merge into new example despite provided malformed data', async () => {
      const res = await suggestNewExample(exampleSuggestionData);
      const malformedMergingExampleSuggestion = { ...res.body, ...malformedExampleSuggestionData };
      const result = await createExample(malformedMergingExampleSuggestion.id);
      expect(result.status).toEqual(200);
      expect(result.body.error).toEqual(undefined);
    });

    it('should return newly created example by searching with keyword', async () => {
      const res = await suggestNewExample(exampleSuggestionData);
      const mergingExampleSuggestion = { ...res.body, ...exampleSuggestionData };
      const result = await createExample(mergingExampleSuggestion.id);
      expect(result.status).toEqual(200);
      expect(result.body.id).not.toEqual(undefined);
      const exampleRes = await getExamples({ keyword: exampleData.igbo });
      expect(exampleRes.status).toEqual(200);
      expect(some(exampleRes.body, (example) => example.igbo === exampleData.igbo)).toEqual(true);
    });
  });

  describe('/PUT mongodb examples', () => {
    it('should create a new example and update it', async () => {
      const res = await suggestNewExample(exampleSuggestionData);
      const mergingExampleSuggestion = { ...res.body, ...exampleSuggestionData };
      const result = await createExample(mergingExampleSuggestion.id);
      expect(result.status).toEqual(200);
      expect(result.body.id).not.toEqual(undefined);
      const exampleRes = await updateExample({ id: result.body.id, ...updatedExampleData });
      expect(exampleRes.status).toEqual(200);
      forIn(updatedExampleData, (value, key) => {
        expect(isEqual(exampleRes.body[key], value)).toEqual(true);
      });
    });
  });
});
