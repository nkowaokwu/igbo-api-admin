import {
  forEach,
  every,
  isEqual,
  times,
} from 'lodash';
import { v4 as uuid } from 'uuid';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import { BULK_UPLOAD_LIMIT } from 'src/Core/constants';
import SentenceType from 'src/backend/shared/constants/SentenceType';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import {
  approveExampleSuggestion,
  suggestNewExample,
  updateExampleSuggestion,
  getExampleSuggestions,
  getExampleSuggestion,
  getRandomExampleSuggestions,
  getRandomExampleSuggestionsToReview,
  deleteExampleSuggestion,
  postBulkUploadExampleSuggestions,
  suggestNewWord,
  createWord,
  getWords,
  getTotalVerifiedExampleSuggestions,
  getTotalRecordedExampleSuggestions,
  putAudioForRandomExampleSuggestions,
  putReviewForRandomExampleSuggestions,
} from './shared/commands';
import {
  wordSuggestionData,
  exampleSuggestionData,
  exampleSuggestionApprovedData,
  malformedExampleSuggestionData,
  updatedExampleSuggestionData,
  wordSuggestionWithNestedExampleSuggestionData,
  bulkUploadExampleSuggestionData,
} from './__mocks__/documentData';
import { AUTH_TOKEN, EXAMPLE_SUGGESTION_KEYS, INVALID_ID } from './shared/constants';
import { expectUniqSetsOfResponses, expectArrayIsInOrder } from './shared/utils';
import SortingDirections from '../backend/shared/constants/sortingDirections';

describe('MongoDB Example Suggestions', () => {
  /* Create a base word and exampleSuggestion document */
  beforeAll(async () => {
    await Promise.all([
      suggestNewWord(wordSuggestionData)
        .then((res) => createWord(res.body.id)),
      suggestNewExample(exampleSuggestionData)
        .then(() => {}),
    ]);
  });
  describe('/POST mongodb exampleSuggestions', () => {
    it('should save submitted example suggestion', async () => {
      const res = await suggestNewExample(exampleSuggestionData);
      expect(res.status).toEqual(200);
      expect(res.body.id).not.toEqual(undefined);
    });

    it('should return an example error because of malformed data', async () => {
      const res = await suggestNewExample(malformedExampleSuggestionData);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return an example error because of malformed nsibidi data', async () => {
      const res = await suggestNewExample({ ...exampleSuggestionData, nsibdi: '人' });
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return an example error because of invalid associateWords ids', async () => {
      const malformedData = {
        ...updatedExampleSuggestionData,
        associatedWords: [...updatedExampleSuggestionData.associatedWords, 'okokok'],
      };
      const res = await suggestNewExample(malformedData);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should bulk upload at most 500 example suggestions', async () => {
      const payload = times(BULK_UPLOAD_LIMIT, () => {
        const igbo = uuid();
        const exampleSuggestionData = { ...bulkUploadExampleSuggestionData, igbo };
        return exampleSuggestionData;
      });
      const res = await postBulkUploadExampleSuggestions(payload);
      expect(res.status).toEqual(200);
      expect(res.body.every(({ style, type }) => (
        type === SentenceType.DATA_COLLECTION && style === ExampleStyle.NO_STYLE.value
      )));
    });

    it('should bulk upload at most 500 example suggestions with biblical type', async () => {
      const payload = times(BULK_UPLOAD_LIMIT, () => {
        const igbo = uuid();
        const exampleSuggestionData = { ...bulkUploadExampleSuggestionData, igbo, type: SentenceType.BIBLICAL };
        return exampleSuggestionData;
      });
      const res = await postBulkUploadExampleSuggestions(payload);
      expect(res.status).toEqual(200);
      expect(res.body.every(({ type }) => type === SentenceType.BIBLICAL));
    });

    it('should bulk upload at most 500 example suggestions with proverb style', async () => {
      const payload = times(BULK_UPLOAD_LIMIT, () => {
        const igbo = uuid();
        const exampleSuggestionData = { ...bulkUploadExampleSuggestionData, igbo, style: ExampleStyle.PROVERB.value };
        return exampleSuggestionData;
      });
      const res = await postBulkUploadExampleSuggestions(payload);
      expect(res.status).toEqual(200);
      expect(res.body.every(({ style }) => style === ExampleStyle.PROVERB.value));
    });

    it('should bulk upload at most 500 example suggestions with english', async () => {
      const payload = times(BULK_UPLOAD_LIMIT, () => {
        const igbo = uuid();
        const english = uuid();
        const exampleSuggestionData = { ...bulkUploadExampleSuggestionData, igbo, english };
        return exampleSuggestionData;
      });
      const res = await postBulkUploadExampleSuggestions(payload);
      expect(res.status).toEqual(200);
      expect(res.body.every(({ style }) => style === ExampleStyle.PROVERB.value));
    });

    it('should throw an error due to too many example suggestions for bulk upload', async () => {
      const payload = times(600, () => {
        const igbo = uuid();
        const exampleSuggestionData = { ...bulkUploadExampleSuggestionData, igbo };
        return exampleSuggestionData;
      });
      const res = await postBulkUploadExampleSuggestions(payload);
      expect(res.status).toEqual(400);
    });

    it('should throw an error with malformed bulk upload data', async () => {
      const payload = { ...bulkUploadExampleSuggestionData, invalidKey: 'igbo' };
      // @ts-expect-error payload
      const res = await postBulkUploadExampleSuggestions(payload);
      expect(res.status).toEqual(400);
    });

    it('should throw an error with malformed data (not an array)', async () => {
      const payload = { ...bulkUploadExampleSuggestionData, igbo: 'igbo' };
      // @ts-expect-error payload
      const res = await postBulkUploadExampleSuggestions(payload);
      expect(res.status).toEqual(400);
    });

    it('should throw an error with already existing data', async () => {
      const igbo = uuid();
      const firstPayload = [{ ...bulkUploadExampleSuggestionData, igbo }];
      await postBulkUploadExampleSuggestions(firstPayload);

      const payload = [
        { ...bulkUploadExampleSuggestionData, igbo },
        { ...bulkUploadExampleSuggestionData, igbo },
      ];
      const res = await postBulkUploadExampleSuggestions(payload);
      expect(res.body[0].success).toBe(false);
      expect(res.body[0].meta.sentenceData).toBeDefined();
    });

    it('should throw an error bulk uploading example suggestions with insufficient permissions', async () => {
      const payload = [{ ...bulkUploadExampleSuggestionData, igbo: uuid() }];
      const res = await postBulkUploadExampleSuggestions(payload, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN });
      expect(res.status).toEqual(403);
    });
  });

  describe('/PUT mongodb exampleSuggestions', () => {
    it('should update specific exampleSuggestion with provided data', async () => {
      const updatedIgboText = 'updated igbo text';
      const wordsRes = await getWords();
      expect(wordsRes.status).toEqual(200);
      const word = wordsRes.body[0];
      const res = await suggestNewExample({ ...exampleSuggestionData, igbo: uuid(), associatedWords: [word.id] });
      expect(res.status).toEqual(200);
      expect([undefined, null, '']).not.toContain(res.body.authorId);
      const result = await updateExampleSuggestion({ ...res.body, igbo: updatedIgboText });
      expect(result.status).toEqual(200);
      expect(result.body.igbo).toEqual(updatedIgboText);
      expect(result.body.authorId).toEqual(res.body.authorId);
    });

    it('should return an example error because of malformed data after creating and example suggestion', async () => {
      const res = await suggestNewExample(exampleSuggestionData);
      expect(res.status).toEqual(200);
      const result = await updateExampleSuggestion(malformedExampleSuggestionData);
      expect(result.status).toEqual(400);
    });

    it('should return an error because document doesn\'t exist', async () => {
      const res = await getExampleSuggestion(INVALID_ID);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should throw an error for providing an invalid id', async () => {
      const res = await updateExampleSuggestion({ id: INVALID_ID });
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should throw an error for invalid id within associatedDefinitionsSchemas', async () => {
      const exampleRes = await suggestNewExample(exampleSuggestionData);
      expect(exampleRes.status).toEqual(200);
      const res = await updateExampleSuggestion({
        ...exampleRes.body,
        associatedDefinitionsSchemas: [null],
      });
      expect(res.status).toEqual(400);
    });
  });

  describe('/GET mongodb exampleSuggestions', () => {
    it('should return an example suggestion by searching', async () => {
      const exampleText = exampleSuggestionData.igbo;
      const exampleRes = await suggestNewExample(exampleSuggestionData);
      const res = await getExampleSuggestions({ keyword: exampleText });
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const resExample = res.body.find(({ id }) => id === exampleRes.body.id);
      forEach(Object.keys(exampleSuggestionData), (key) => {
        expect(resExample[key]).toEqual(exampleSuggestionData[key]);
      });
    });

    it('should return an example suggestion by searching with filter query', async () => {
      const exampleText = exampleSuggestionData.igbo;
      await suggestNewExample(exampleSuggestionData);
      const res = await getExampleSuggestions({ filter: { igbo: exampleText } });
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      forEach(Object.keys(exampleSuggestionData), (key) => {
        expect(res.body[0][key]).toEqual(exampleSuggestionData[key]);
      });
    });

    it('should return all example suggestions', async () => {
      await Promise.all([suggestNewExample(exampleSuggestionData), suggestNewExample(exampleSuggestionData)]);
      const res = await getExampleSuggestions();
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      forEach(res.body, (exampleSuggestion) => {
        forEach(Object.keys(exampleSuggestion), (exampleSuggestionKey) => {
          expect(EXAMPLE_SUGGESTION_KEYS).toContain(exampleSuggestionKey);
        });
      });
    });

    it('should be sorted by number of approvals', async () => {
      const exampleSuggestionsRes = await Promise.all([
        suggestNewExample(exampleSuggestionData),
        suggestNewExample(exampleSuggestionApprovedData),
      ]);
      await approveExampleSuggestion(exampleSuggestionsRes[0]);
      const res = await getExampleSuggestions();
      expect(res.status).toEqual(200);
      expectArrayIsInOrder(res.body, 'approvals', SortingDirections.DESCENDING);
    });

    it('should return one example suggestion', async () => {
      const res = await suggestNewExample(exampleSuggestionData);
      expect(res.status).toEqual(200);
      const result = await getExampleSuggestion(res.body.id);
      expect(result.status).toEqual(200);
      forEach(Object.keys(result.body), (exampleSuggestionKey) => {
        expect(EXAMPLE_SUGGESTION_KEYS).toContain(exampleSuggestionKey);
      });
    });

    it('should return at most twenty five example suggestions per request with range query', async () => {
      const res = await Promise.all([
        getExampleSuggestions({ range: true }),
        getExampleSuggestions({ range: '[10,34]' }),
        getExampleSuggestions({ range: '[35,59]' }),
      ]);
      expectUniqSetsOfResponses(res, 25);
    });

    it('should return at most four example suggestions per request with range query', async () => {
      const res = await getExampleSuggestions({ range: '[5,8]' });
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeLessThanOrEqual(4);
    });

    it('should return at most thirty example suggestions because of a large range', async () => {
      const res = await getExampleSuggestions({ range: '[10,39]' });
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeLessThanOrEqual(30);
    });

    it('should return at most ten example suggestions because of a tiny range', async () => {
      const res = await getExampleSuggestions({ range: '[10,9]' });
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('should throw an error due to an invalid range', async () => {
      const res = await getExampleSuggestions({ range: 'incorrect' });
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return at most ten example suggestions per request with range query', async () => {
      const res = await Promise.all([
        getExampleSuggestions({ range: '[0,9]' }),
        getExampleSuggestions({ range: '[10,19]' }),
        getExampleSuggestions({ range: '[20,29]' }),
        getExampleSuggestions({ range: [30, 39] }),
      ]);
      expectUniqSetsOfResponses(res);
    });

    it('should return different sets of example suggestions for pagination', async () => {
      const res = await Promise.all([
        getExampleSuggestions({ page: 0 }),
        getExampleSuggestions({ page: 1 }),
        getExampleSuggestions({ page: 2 }),
      ]);
      expectUniqSetsOfResponses(res);
    });

    it('should return prioritize range over page', async () => {
      const res = await Promise.all([
        getExampleSuggestions({ page: '1' }),
        getExampleSuggestions({ page: '1', range: '[0,10]' }),
      ]);
      expect(isEqual(res[0].body, res[1].body)).toEqual(false);
    });

    it('should return a descending sorted list of example suggestions with sort query', async () => {
      const key = 'word';
      const direction = SortingDirections.DESCENDING;
      const res = await getExampleSuggestions({ sort: `["${key}", "${direction}"]` });
      expect(res.status).toEqual(200);
      expectArrayIsInOrder(res.body, key, direction);
    });

    it('should return an ascending sorted list of example suggestions with sort query', async () => {
      const key = 'definitions';
      const direction = SortingDirections.ASCENDING;
      const res = await getExampleSuggestions({ sort: `["${key}", "${direction}"]` });
      expect(res.status).toEqual(200);
      expectArrayIsInOrder(res.body, key, direction);
    });

    it('should throw an error due to malformed sort query', async () => {
      const key = 'wordClass';
      const res = await getExampleSuggestions({ sort: `["${key}]` });
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should throw an error due to invalid sorting ordering', async () => {
      const key = 'igbo';
      const res = await getExampleSuggestions({ sort: `["${key}", "invalid"]` });
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return filtered body excluding nested exampleSuggestions within wordSuggestions', async () => {
      const res = await suggestNewWord(wordSuggestionWithNestedExampleSuggestionData);
      expect(res.status).toEqual(200);
      const wordSuggestionWord = res.body.word;
      const nestedExampleSuggestionId = res.body.examples[0].id;
      const result = await getExampleSuggestion(nestedExampleSuggestionId);
      expect(result.status).toEqual(200);
      expect(result.body.exampleForSuggestion).toEqual(true);
      const exampleSuggestionsRes = await getExampleSuggestions({ keyword: wordSuggestionWord });
      expect(exampleSuggestionsRes.status).toEqual(200);
      expect(every(exampleSuggestionsRes.body, (exampleSuggestion) => (
        exampleSuggestion.id !== nestedExampleSuggestionId
      )));
    });

    it('should throw an error for providing an invalid id', async () => {
      const res = await getExampleSuggestion(INVALID_ID);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });
  });

  describe('Igbo Soundbox', () => {
    it('should save audio for five random example sentences', async () => {
      const examples = [];
      await Promise.all(times(5, async () => {
        const exampleRes = await suggestNewExample(
          { ...exampleSuggestionData, igbo: uuid() },
          { token: AUTH_TOKEN.MERGER_AUTH_TOKEN },
        );
        expect(exampleRes.body.approvals).toHaveLength(0);
        expect(exampleRes.body.denials).toHaveLength(0);
        examples.push(exampleRes.body);
      }));

      const updateExamplePayload = examples.map(({ id }) => ({
        id,
        pronunciation: `pronunciation-${id}`,
      }));
      const updatedExamplesRes = await putAudioForRandomExampleSuggestions(updateExamplePayload);
      expect(updatedExamplesRes.status).toEqual(200);
      await Promise.all(updatedExamplesRes.body.map(async (id) => {
        const exampleSuggestionRes = await getExampleSuggestion(id);
        expect(exampleSuggestionRes.status).toEqual(200);
        expect(exampleSuggestionRes.body.pronunciations).toHaveLength(1);
        expect(exampleSuggestionRes.body.pronunciations[0].audio).toContain(`${id}-`);
        expect(exampleSuggestionRes.body.pronunciations[0].speaker).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      }));

      // Save again but with crowdsourcer permissions
      const crowdsourcerUpdatedExamplesRes = await putAudioForRandomExampleSuggestions(
        updateExamplePayload,
        { token: AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN },
      );
      expect(crowdsourcerUpdatedExamplesRes.status).toEqual(200);
      await Promise.all(updatedExamplesRes.body.map(async (id) => {
        const exampleSuggestionRes = await getExampleSuggestion(id);
        expect(exampleSuggestionRes.status).toEqual(200);
        expect(exampleSuggestionRes.body.pronunciations).toHaveLength(2);
        expect(exampleSuggestionRes.body.pronunciations[1].audio).toContain(`${id}-`);
        expect(exampleSuggestionRes.body.pronunciations[1].speaker).toEqual(AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN);
      }));
    });
    // eslint-disable-next-line max-len
    it('should get five random example suggestions with no user interactions or speaker id associated with user', async () => {
      await Promise.all(times(5, async () => {
        const exampleRes = await suggestNewExample(
          { ...exampleSuggestionData, igbo: uuid() },
          { token: AUTH_TOKEN.MERGER_AUTH_TOKEN },
        );
        expect(exampleRes.body.approvals).toHaveLength(0);
        expect(exampleRes.body.denials).toHaveLength(0);
      }));
      const res = await getRandomExampleSuggestions({ range: '[0, 4]' });
      expect(res.status).toEqual(200);
      expect(res.body).toHaveLength(5);
      res.body.forEach((exampleSuggestion) => {
        expect(exampleSuggestion.userInteractions).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
        expect(exampleSuggestion.pronunciations.every(({ speaker }) => speaker !== AUTH_TOKEN.ADMIN_AUTH_TOKEN))
          .toBeTruthy();
        expect(exampleSuggestion.approvals).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
        expect(exampleSuggestion.denials).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
        expect(exampleSuggestion.approvals.length).toBeLessThanOrEqual(1);
        expect(exampleSuggestion.denials.length).toBeLessThanOrEqual(1);
      });
    });

    it('should get five more example suggestions after recording audio for five random sentences', async () => {
      await Promise.all(times(5, async () => {
        const exampleRes = await suggestNewExample(
          {
            ...exampleSuggestionData,
            pronunciations: [
              { audio: 'audio-id', speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN },
              { audio: 'audio-id', speaker: AUTH_TOKEN.EDITOR_AUTH_TOKEN },
            ],
            igbo: uuid(),
          },
          { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN },
        );
        expect(exampleRes.body.approvals).toHaveLength(0);
        expect(exampleRes.body.denials).toHaveLength(0);
        const res = await getRandomExampleSuggestions({ range: '[0, 4]' }, { token: AUTH_TOKEN.MERGER_AUTH_TOKEN });
        expect(res.status).toEqual(200);
        expect(res.body.length).toBeLessThanOrEqual(5);
        res.body.forEach((exampleSuggestion) => {
          expect(exampleSuggestion.userInteractions).not.toContain(AUTH_TOKEN.MERGER_AUTH_TOKEN);
          expect(exampleSuggestion.pronunciations.every(({ speaker }) => speaker !== AUTH_TOKEN.MERGER_AUTH_TOKEN))
            .toBeTruthy();
          expect(exampleSuggestion.approvals.length).toBeLessThanOrEqual(1);
          expect(exampleSuggestion.denials.length).toBeLessThanOrEqual(1);
        });
      }));
    });

    it('should approve, deny, and skip example suggestions', async () => {
      await Promise.all(times(5, async (index) => {
        const exampleRes = await suggestNewExample(
          {
            ...exampleSuggestionData,
            igbo: index === 0 ? 'approve' : index === 1 ? 'deny' : 'skip',
            pronunciations: [{ audio: 'pronunciation', speaker: '' }],
          },
          { token: AUTH_TOKEN.MERGER_AUTH_TOKEN },
        );
        expect(exampleRes.body.approvals).toHaveLength(0);
        expect(exampleRes.body.denials).toHaveLength(0);
      }));
      const randomExampleSuggestionsRes = await getRandomExampleSuggestionsToReview();
      expect(randomExampleSuggestionsRes.status).toEqual(200);
      const reviewedExampleSuggestions = randomExampleSuggestionsRes.body.map(({ id, pronunciations }, index) => {
        expect(Array.isArray(pronunciations)).toBeTruthy();
        expect(pronunciations.length).toBeGreaterThanOrEqual(1);
        const reviews = pronunciations.reduce((reviewObject, { _id }) => ({
          ...reviewObject,
          [_id.toString()]: index === 0 ? ReviewActions.APPROVE : index === 1 ? ReviewActions.DENY : ReviewActions.SKIP,
        }), {});
        return { id, reviews };
      });
      const updatedRandomExampleSuggestionRes = await putReviewForRandomExampleSuggestions(reviewedExampleSuggestions);
      expect(updatedRandomExampleSuggestionRes.status).toEqual(200);
      await Promise.all(reviewedExampleSuggestions.map(async ({ id: randomExampleSuggestionId }, index) => {
        const randomExampleSuggestion = await getExampleSuggestion(randomExampleSuggestionId);
        if (index === 0) {
          expect(randomExampleSuggestion.body.pronunciations.some(({ approvals }) => (
            approvals.includes(AUTH_TOKEN.ADMIN_AUTH_TOKEN)))).toBeTruthy();
          expect(randomExampleSuggestion.body.userInteractions).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
        } else if (index === 1) {
          expect(randomExampleSuggestion.body.pronunciations.some(({ denials }) => (
            denials.includes(AUTH_TOKEN.ADMIN_AUTH_TOKEN)))).toBeTruthy();
          expect(randomExampleSuggestion.body.userInteractions).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
        } else {
          expect(randomExampleSuggestion.body.pronunciations.some(({ approvals, denials }) => (
            !approvals.includes(AUTH_TOKEN.ADMIN_AUTH_TOKEN) && !denials.includes(AUTH_TOKEN.ADMIN_AUTH_TOKEN)
          ))).toBeTruthy();
          expect(randomExampleSuggestion.body.userInteractions).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
        }
      }));
      const newRandomExampleSuggestionsRes = await getRandomExampleSuggestions();
      expect(newRandomExampleSuggestionsRes.status).toEqual(200);
      newRandomExampleSuggestionsRes.body.forEach((newRandomExampleSuggestion) => {
        expect(newRandomExampleSuggestion.userInteractions).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      });
      const verifiedRes = await getTotalVerifiedExampleSuggestions();
      expect(verifiedRes.body.count).toBeGreaterThanOrEqual(2);
    });

    it('should show all example suggestion stats for user', async () => {
      const verifiedRes = await getTotalVerifiedExampleSuggestions();
      const recordedRes = await getTotalRecordedExampleSuggestions();
      expect(verifiedRes.status).toEqual(200);
      expect(recordedRes.status).toEqual(200);
      expect(typeof verifiedRes.body.count).toEqual('number');
      expect(typeof recordedRes.body.count).toEqual('number');
    });
  });

  describe('/DELETE mongodb exampleSuggestions', () => {
    it('should delete an existing example suggestion', async () => {
      const res = await getExampleSuggestions();
      expect(res.status).toEqual(200);
      const firstExample = res.body[0];
      const deleteRes = await deleteExampleSuggestion(firstExample.id);
      expect(deleteRes.status).toEqual(200);
      const searchExampleRes = await getExampleSuggestion(firstExample.id);
      expect(searchExampleRes.status).toEqual(404);
      expect(searchExampleRes.body.error).not.toEqual(undefined);
    });

    it('should return an error for attempting to deleting a non-existing example suggestion', async () => {
      const deleteRes = await deleteExampleSuggestion(INVALID_ID);
      expect(deleteRes.status).toEqual(400);
    });

    it('should throw an error for providing an invalid id', async () => {
      const res = await deleteExampleSuggestion(INVALID_ID);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });
  });
});
