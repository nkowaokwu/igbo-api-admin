import { forEach, every, isEqual } from 'lodash';
import { v4 as uuid } from 'uuid';
import {
  approveExampleSuggestion,
  suggestNewExample,
  updateExampleSuggestion,
  getExampleSuggestions,
  getExampleSuggestion,
  deleteExampleSuggestion,
  suggestNewWord,
  createWord,
  getWords,
} from './shared/commands';
import {
  wordSuggestionData,
  exampleSuggestionData,
  exampleSuggestionApprovedData,
  malformedExampleSuggestionData,
  updatedExampleSuggestionData,
  wordSuggestionWithNestedExampleSuggestionData,
} from './__mocks__/documentData';
import { EXAMPLE_SUGGESTION_KEYS, INVALID_ID } from './shared/constants';
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
      expect(res.body.message).not.toEqual(undefined);
    });

    it('should return an example error because of invalid associateWords ids', async () => {
      const malformedData = {
        ...updatedExampleSuggestionData,
        associatedWords: [...updatedExampleSuggestionData.associatedWords, 'okokok'],
      };
      const res = await suggestNewExample(malformedData);
      expect(res.status).toEqual(400);
      expect(res.body.message).not.toEqual(undefined);
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
  });

  describe('/GET mongodb exampleSuggestions', () => {
    it('should return an example suggestion by searching', async () => {
      const exampleText = exampleSuggestionData.igbo;
      await suggestNewExample(exampleSuggestionData);
      const res = await getExampleSuggestions({ keyword: exampleText });
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      forEach(Object.keys(exampleSuggestionData), (key) => {
        expect(res.body[0][key]).toEqual(exampleSuggestionData[key]);
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
