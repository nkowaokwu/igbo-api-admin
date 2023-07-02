import {
  isEqual,
  forIn,
  some,
  times,
} from 'lodash';
import { ulid } from 'ulid'

import SentenceType from 'src/backend/shared/constants/SentenceType';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import { BULK_UPLOAD_LIMIT } from 'src/Core/constants';
import {
  createExample,
  getExamples,
  getExample,
  updateExample,
  suggestNewExample,
  getExampleSuggestion,
  getExampleSuggestions,
  postBulkUploadExamples,
} from './shared/commands';
import { AUTH_TOKEN } from './shared/constants';
import {
  exampleData,
  exampleSuggestionData,
  malformedExampleSuggestionData,
  updatedExampleData,
  bulkUploadExampleSuggestionData,
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

    it('should bulk upload at most 500 examples', async () => {
      const payload = times(BULK_UPLOAD_LIMIT, () => {
        const igbo = ulid();
        const exampleData = { ...bulkUploadExampleSuggestionData, igbo };
        return exampleData;
      });
      const res = await postBulkUploadExamples(payload);
      expect(res.status).toEqual(200);
      expect(res.body.every(({ style, type }) => (
        type === SentenceType.DATA_COLLECTION && style === ExampleStyle.NO_STYLE.value
      )));
    });

    it('should bulk upload at most 500 examples with biblical type', async () => {
      const payload = times(BULK_UPLOAD_LIMIT, () => {
        const igbo = ulid();
        const exampleData = { ...bulkUploadExampleSuggestionData, igbo, type: SentenceType.BIBLICAL };
        return exampleData;
      });
      const res = await postBulkUploadExamples(payload);
      expect(res.status).toEqual(200);
      expect(res.body.every(({ type }) => type === SentenceType.BIBLICAL));
    });

    it('should bulk upload at most 500 examples with proverb style', async () => {
      const payload = times(BULK_UPLOAD_LIMIT, () => {
        const igbo = ulid();
        const exampleData = { ...bulkUploadExampleSuggestionData, igbo, style: ExampleStyle.PROVERB.value };
        return exampleData;
      });
      const res = await postBulkUploadExamples(payload);
      expect(res.status).toEqual(200);
      expect(res.body.every(({ style }) => style === ExampleStyle.PROVERB.value));
    });

    it('should bulk upload at most 500 examples with english', async () => {
      const payload = times(BULK_UPLOAD_LIMIT, () => {
        const igbo = ulid();
        const english = ulid();
        const exampleData = { ...bulkUploadExampleSuggestionData, igbo, english };
        return exampleData;
      });
      const res = await postBulkUploadExamples(payload);
      expect(res.status).toEqual(200);
      expect(res.body.every(({ style }) => style === ExampleStyle.PROVERB.value));
    });

    it('should throw an error due to too many examples for bulk upload', async () => {
      const payload = times(600, () => {
        const igbo = ulid();
        const exampleData = { ...bulkUploadExampleSuggestionData, igbo };
        return exampleData;
      });
      const res = await postBulkUploadExamples(payload);
      expect(res.status).toEqual(400);
    });

    it('should throw an error with malformed bulk upload data', async () => {
      const payload = { ...bulkUploadExampleSuggestionData, invalidKey: 'igbo' };
      // @ts-expect-error payload
      const res = await postBulkUploadExamples(payload);
      expect(res.status).toEqual(400);
    });

    it('should throw an error with malformed data (not an array)', async () => {
      const payload = { ...bulkUploadExampleSuggestionData, igbo: 'igbo' };
      // @ts-expect-error payload
      const res = await postBulkUploadExamples(payload);
      expect(res.status).toEqual(400);
    });

    it('should throw an error bulk uploading examples with already existing data', async () => {
      const igbo = ulid();
      const firstPayload = [{ ...bulkUploadExampleSuggestionData, igbo }];
      await postBulkUploadExamples(firstPayload);

      const payload = [
        { ...bulkUploadExampleSuggestionData, igbo },
        { ...bulkUploadExampleSuggestionData, igbo },
      ];
      const res = await postBulkUploadExamples(payload);
      expect(res.body[0].success).toBe(false);
      expect(res.body[0].meta.sentenceData).toBeDefined();
    });

    it('should throw an error with insufficient permissions', async () => {
      const payload = [{ ...bulkUploadExampleSuggestionData, igbo: ulid() }];
      const res = await postBulkUploadExamples(payload, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN });
      expect(res.status).toEqual(403);
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
