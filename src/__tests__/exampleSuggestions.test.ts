import {
  forEach,
  every,
  isEqual,
  times,
} from 'lodash';
import { v4 as uuid } from 'uuid';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import { BULK_UPLOAD_LIMIT } from 'src/Core/constants';
import {
  approveExampleSuggestion,
  suggestNewExample,
  updateExampleSuggestion,
  getExampleSuggestions,
  getExampleSuggestion,
  getRandomExampleSuggestions,
  putRandomExampleSuggestions,
  deleteExampleSuggestion,
  postBulkUploadExampleSuggestions,
  suggestNewWord,
  createWord,
  getWords,
  getTotalVerifiedExampleSuggestions,
  getTotalRecordedExampleSuggestions,
} from './shared/commands';
import {
  wordSuggestionData,
  exampleSuggestionData,
  exampleSuggestionApprovedData,
  malformedExampleSuggestionData,
  updatedExampleSuggestionData,
  wordSuggestionWithNestedExampleSuggestionData,
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
        const exampleSuggestionData = { igbo };
        return exampleSuggestionData;
      });
      const res = await postBulkUploadExampleSuggestions(payload);
      expect(res.status).toEqual(200);
    });

    it('should throw an error due to too many example suggestions for bulk upload', async () => {
      const payload = times(600, () => {
        const igbo = uuid();
        const exampleSuggestionData = { igbo };
        return exampleSuggestionData;
      });
      const res = await postBulkUploadExampleSuggestions(payload);
      expect(res.status).toEqual(400);
    });

    it('should throw an error with malformed bulk upload data', async () => {
      const payload = { igbo: 'igbo' };
      // @ts-expect-error payload
      const res = await postBulkUploadExampleSuggestions(payload);
      expect(res.status).toEqual(400);
    });

    it('should throw an error with malformed (extra field) bulk upload data', async () => {
      const payload = [{ igbo: 'igbo', english: 'english' }];
      const res = await postBulkUploadExampleSuggestions(payload);
      expect(res.status).toEqual(400);
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
    it('should get five random example suggestions with no user interactions associated with user', async () => {
      times(5, async () => {
        const exampleRes = await suggestNewExample(
          { ...exampleSuggestionData, igbo: uuid() },
          { token: AUTH_TOKEN.MERGER_AUTH_TOKEN },
        );
        expect(exampleRes.body.approvals).toHaveLength(0);
        expect(exampleRes.body.denials).toHaveLength(0);
      });
      const res = await getRandomExampleSuggestions({ range: '[0, 4]' });
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeLessThanOrEqual(5);
      res.body.forEach((exampleSuggestion) => {
        expect(exampleSuggestion.userInteractions).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
        expect(exampleSuggestion.pronunciation).toBeFalsy();
        expect(exampleSuggestion.approvals.length).toBeLessThanOrEqual(1);
        expect(exampleSuggestion.denials.length).toBeLessThanOrEqual(1);
      });
    });

    it('should approve, deny, and skip example suggestions', async () => {
      times(5, async () => {
        const exampleRes = await suggestNewExample({ ...exampleSuggestionData, igbo: uuid() });
        expect(exampleRes.body.approvals).toHaveLength(0);
        expect(exampleRes.body.denials).toHaveLength(0);
      });
      const randomExampleSuggestionsRes = await getRandomExampleSuggestions();
      expect(randomExampleSuggestionsRes.status).toEqual(200);
      const reviewedExampleSuggestions = randomExampleSuggestionsRes.body.map(({ id, pronunciations }, index) => {
        expect(pronunciations[0]).toBeTruthy();
        if (index === 0) {
          return { id, review: ReviewActions.APPROVE };
        }
        if (index === 1) {
          return { id, review: ReviewActions.DENY };
        }
        return { id, review: ReviewActions.SKIP };
      });
      const updatedRandomExampleSuggestionRes = await putRandomExampleSuggestions(reviewedExampleSuggestions);
      expect(updatedRandomExampleSuggestionRes.status).toEqual(200);
      await Promise.all(updatedRandomExampleSuggestionRes.body.map(async (randomExampleSuggestionId, index) => {
        const randomExampleSuggestion = await getExampleSuggestion(randomExampleSuggestionId);
        if (index === 0) {
          expect(randomExampleSuggestion.body.approvals).toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
          expect(randomExampleSuggestion.body.userInteractions).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
        } else if (index === 1) {
          expect(randomExampleSuggestion.body.denials).toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
          expect(randomExampleSuggestion.body.userInteractions).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
        } else {
          expect(randomExampleSuggestion.body.approvals).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
          expect(randomExampleSuggestion.body.denials).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
          expect(randomExampleSuggestion.body.userInteractions).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
        }
      }));
      const newRandomExampleSuggestionsRes = await getRandomExampleSuggestions();
      expect(newRandomExampleSuggestionsRes.status).toEqual(200);
      newRandomExampleSuggestionsRes.body.forEach((newRandomExampleSuggestion) => {
        expect(newRandomExampleSuggestion.userInteractions).not.toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      });
      const verifiedRes = await getTotalVerifiedExampleSuggestions();
      expect(verifiedRes.body.count).toEqual(2);
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
