import {
  forEach,
  forIn,
  isEqual,
  omit,
  pick,
} from 'lodash';
import WordClass from 'src/shared/constants/WordClass';
import Tense from 'src/backend/shared/constants/Tense';
import SuggestionSource from 'src/backend/shared/constants/SuggestionSource';
import Dialects from 'src/backend/shared/constants/Dialects';
import {
  approveWordSuggestion,
  deleteWordSuggestion,
  createWord,
  suggestNewWord,
  updateWordSuggestion,
  getWordSuggestions,
  getWordSuggestion,
  getExampleSuggestion,
} from './shared/commands';
import {
  wordSuggestionId,
  wordSuggestionData,
  wordSuggestionApprovedData,
  malformedWordSuggestionData,
  updatedWordSuggestionData,
  wordSuggestionWithNestedExampleSuggestionData,
} from './__mocks__/documentData';
import { WORD_SUGGESTION_KEYS, INVALID_ID, AUTH_TOKEN } from './shared/constants';
import { expectUniqSetsOfResponses, expectArrayIsInOrder } from './shared/utils';
import SortingDirections from '../backend/shared/constants/sortingDirections';

describe('MongoDB Word Suggestions', () => {
  describe('/POST mongodb wordSuggestions', () => {
    it('should save submitted word suggestion', async () => {
      const res = await suggestNewWord(wordSuggestionData);
      expect(res.status).toEqual(200);
      expect(res.body.id).not.toEqual(undefined);
    });

    it('should save submitted word suggestion with a nested example suggestion', async () => {
      const res = await suggestNewWord(wordSuggestionWithNestedExampleSuggestionData);
      expect(res.status).toEqual(200);
      expect(res.body.id).not.toEqual(undefined);
      expect(res.body.examples).toHaveLength(1);
    });

    it('should return a word error because of malformed data', async () => {
      const res = await suggestNewWord(malformedWordSuggestionData);
      expect(res.status).toEqual(400);
      expect(res.body.message).not.toEqual(undefined);
    });

    it('should return a word error because invalid id', async () => {
      const malformedData = { ...wordSuggestionData, originalWordId: 'ok123' };
      const res = await suggestNewWord(malformedData);
      expect(res.status).toEqual(400);
      expect(res.body.message).not.toEqual(undefined);
    });

    it('should throw an error because of invalid word class', async () => {
      const res = await suggestNewWord({
        ...wordSuggestionData,
        wordClass: 'invalid',
      });
      expect(res.status).toEqual(400);
      expect(res.body.message).not.toEqual(undefined);
    });

    it('should persist author id to the dialects object', async () => {
      const res = await suggestNewWord({
        ...wordSuggestionData,
        dialects: [{
          word: 'dialect',
          variations: [],
          dialects: ['AFI'],
          pronunciation: '',
        }],
      });
      expect(res.status).toEqual(200);
      expect(res.body.dialects[0].editor).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
    });

    it('should persist author id to the dialects object after adding and deleting dialect objects', async () => {
      const wordRes = await suggestNewWord({
        ...wordSuggestionData,
        dialects: [{
          word: 'dialect',
          variations: [],
          dialects: [Dialects.AFI.value],
          pronunciation: '',
        }],
      });
      const secondWordRes = await updateWordSuggestion({
        ...wordRes.body,
        dialects: [
          ...wordRes.body.dialects,
          {
            word: 'dialect 2',
            variations: [],
            dialects: [Dialects.ABI.value],
            pronunciation: '',
          },
        ],
      });
      const thirdWordRes = await updateWordSuggestion({
        ...secondWordRes.body,
        dialects: [
          ...secondWordRes.body.dialects,
          {
            word: 'dialect 3',
            variations: [],
            dialects: [Dialects.BON.value],
            pronunciation: '',
          },
        ],
      }, { token: AUTH_TOKEN.MERGER_AUTH_TOKEN, cleanData: true });
      expect(thirdWordRes.status).toEqual(200);
      expect(thirdWordRes.body.dialects[0].editor).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(thirdWordRes.body.dialects[1].editor).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(thirdWordRes.body.dialects[2].editor).toEqual(AUTH_TOKEN.MERGER_AUTH_TOKEN);
      const res = await updateWordSuggestion({
        ...thirdWordRes.body,
        dialects: [
          ...thirdWordRes.body.dialects.map((dialect, index) => {
            if (!index) {
              dialect.word = 'updated first dialect';
            }
            return dialect;
          }),
        ],
      }, { token: AUTH_TOKEN.MERGER_AUTH_TOKEN, cleanData: true });
      expect(res.status).toEqual(200);
      expect(res.body.dialects[0].editor).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(res.body.dialects[1].editor).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(res.body.dialects[2].editor).toEqual(AUTH_TOKEN.MERGER_AUTH_TOKEN);
    });

    it('should throw an error by providing the editor id in payload', async () => {
      const res = await suggestNewWord({
        ...wordSuggestionData,
        dialects: [{
          word: 'dialect',
          variations: [],
          dialects: ['AFI'],
          pronunciation: '',
          editor: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
        }],
      }, { cleanData: false });
      expect(res.status).toEqual(400);
    });
  });

  describe('/PUT mongodb wordSuggestions', () => {
    it('should update specific wordSuggestion with provided data', async () => {
      const res = await suggestNewWord(wordSuggestionData);
      expect(res.status).toEqual(200);
      const result = await updateWordSuggestion({ id: res.body.id, ...updatedWordSuggestionData });
      expect(result.status).toEqual(200);
      forIn(updatedWordSuggestionData, (value, key) => {
        if (key === 'definitions') {
          const cleanedDefinitions = result.body[key]
            .map((definitionGroup) => pick(definitionGroup, ['wordClass', 'definitions']));
          expect(isEqual(cleanedDefinitions, value)).toEqual(true);
        } else {
          expect(isEqual(result.body[key], value)).toEqual(true);
        }
      });
      expect(result.body.authorId).toEqual(res.body.authorId);
    });

    it('should update nested exampleSuggestion inside wordSuggestion', async () => {
      const updatedIgbo = 'updated example igbo text';
      const updatedEnglish = 'updated example english text';
      const res = await suggestNewWord(wordSuggestionWithNestedExampleSuggestionData);
      expect(res.status).toEqual(200);
      const updatedExampleSuggestion = { ...res.body.examples[0], igbo: updatedIgbo, english: updatedEnglish };
      const updatedWordSuggestion = {
        ...wordSuggestionWithNestedExampleSuggestionData,
        examples: [updatedExampleSuggestion],
      };
      const result = await updateWordSuggestion({ id: res.body.id, ...updatedWordSuggestion });
      expect(result.status).toEqual(200);
      expect(result.body.examples[0].igbo).toEqual(updatedIgbo);
      expect(result.body.examples[0].english).toEqual(updatedEnglish);
    });

    it('should fail to update nested exampleSuggestion inside wordSuggestion for invalid associatedWords', async () => {
      const updatedIgbo = 'updated example igbo text';
      const updatedEnglish = 'updated example english text';
      const res = await suggestNewWord(wordSuggestionWithNestedExampleSuggestionData);
      expect(res.status).toEqual(200);
      const updatedExampleSuggestion = {
        ...res.body.examples[0],
        igbo: updatedIgbo,
        english: updatedEnglish,
        associateWords: [INVALID_ID],
      };
      const updatedWordSuggestion = {
        ...wordSuggestionWithNestedExampleSuggestionData,
        examples: [updatedExampleSuggestion],
      };
      const result = await updateWordSuggestion({ id: res.body.id, ...updatedWordSuggestion });
      expect(result.status).toEqual(400);
    });

    it('should delete nested exampleSuggestion inside wordSuggestion', async () => {
      const res = await suggestNewWord(wordSuggestionWithNestedExampleSuggestionData);
      expect(res.status).toEqual(200);
      const exampleSuggestionToDeleteId = res.body.examples[0].id;
      const updatedWordSuggestion = {
        ...wordSuggestionWithNestedExampleSuggestionData,
        examples: [],
      };
      const result = await updateWordSuggestion({ id: res.body.id, ...updatedWordSuggestion });
      expect(result.status).toEqual(200);
      expect(result.body.examples).toHaveLength(0);
      getExampleSuggestion(exampleSuggestionToDeleteId)
        .end((_, noExampleSuggestionRes) => {
          expect(noExampleSuggestionRes.status).toEqual(404);
          expect(noExampleSuggestionRes.body.error).not.toEqual(undefined);
        });
    });

    it('should throw an error because the nested example suggestion has an invalid id', async () => {
      const res = await suggestNewWord(wordSuggestionWithNestedExampleSuggestionData);
      expect(res.status).toEqual(200);
      const updatedExampleSuggestion = { ...res.body.examples[0], id: INVALID_ID };
      const updatedWordSuggestion = {
        ...wordSuggestionWithNestedExampleSuggestionData,
        examples: [updatedExampleSuggestion],
      };
      const result = await updateWordSuggestion(updatedWordSuggestion);
      expect(result.status).toEqual(400);
      expect(result.body.error).not.toEqual(undefined);
    });

    it.skip('should throw an error when new yet identical exampleSuggestion data is provided', async () => {
      const res = await suggestNewWord(wordSuggestionWithNestedExampleSuggestionData);
      expect(res.status).toEqual(200);
      const duplicateExampleSuggestionsInWordSuggestion = res.body;
      const { igbo, english } = res.body.examples[0];
      duplicateExampleSuggestionsInWordSuggestion.examples.push({ igbo, english });
      const result = await updateWordSuggestion(duplicateExampleSuggestionsInWordSuggestion);
      expect(result.status).toEqual(400);
      expect(result.body.error).not.toEqual(undefined);
    });

    it('should return an example error because of malformed data', async () => {
      const res = await suggestNewWord(wordSuggestionData);
      expect(res.status).toEqual(200);
      const result = await updateWordSuggestion(malformedWordSuggestionData);
      expect(result.status).toEqual(400);
    });

    it('should return an error because document doesn\'t exist', async () => {
      const res = await getWordSuggestion(INVALID_ID);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should throw an error for providing an invalid id', async () => {
      const res = await updateWordSuggestion({ id: INVALID_ID });
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should throw an error for providing a source field', async () => {
      const wordRes = await suggestNewWord(wordSuggestionData);
      const res = await updateWordSuggestion(
        { ...wordRes.body, source: SuggestionSource.COMMUNITY },
        { cleanData: false },
      );
      expect(res.status).toEqual(400);
      expect(res.body.message).not.toEqual(undefined);
    });

    it('should update the updatedAt field', async () => {
      const wordSuggestionsRes = await getWordSuggestions();
      expect(wordSuggestionsRes.status).toEqual(200);
      const wordSuggestion = wordSuggestionsRes.body[0];
      delete wordSuggestion.definitions[0].id;
      const res = await updateWordSuggestion({ ...wordSuggestion, word: 'updated' });
      expect(res.status).toEqual(200);
      expect(Date.parse(wordSuggestion.updatedAt)).toBeLessThan(Date.parse(res.body.updatedAt));
    });

    it('should include first definition group, create a new definition group, and delete the first', async () => {
      const wordSuggestionRes = await suggestNewWord(wordSuggestionData);
      const updatedWordSuggestionRes = await updateWordSuggestion({
        ...wordSuggestionRes.body,
        definitions: wordSuggestionRes.body.definitions
          .map((definitionGroup) => pick(definitionGroup, ['wordClass', 'definitions']))
          .concat({ wordClass: WordClass.AV.value, definitions: ['first verb'] }),
      });
      expect(updatedWordSuggestionRes.body.definitions[0].wordClass)
        .toEqual(wordSuggestionData.definitions[0].wordClass);
      expect(isEqual(
        updatedWordSuggestionRes.body.definitions[0].definitions,
        wordSuggestionData.definitions[0].definitions,
      )).toEqual(true);
      expect(updatedWordSuggestionRes.body.definitions[1].wordClass).toEqual(WordClass.AV.value);
      expect(isEqual(updatedWordSuggestionRes.body.definitions[1].definitions, ['first verb'])).toEqual(true);
      const updatedDefinitions = [...updatedWordSuggestionRes.body.definitions];
      updatedDefinitions.splice(0, 1);
      const finalWordSuggestionRes = await updateWordSuggestion({
        ...updatedWordSuggestionRes.body,
        definitions: updatedDefinitions.map((definitionGroup) => omit(definitionGroup, ['id'])),
      });
      expect(finalWordSuggestionRes.body.definitions[0].wordClass).toEqual(WordClass.AV.value);
      expect(isEqual(finalWordSuggestionRes.body.definitions[0].definitions, ['first verb'])).toEqual(true);
    });

    it('should create a word suggestion with tenses', async () => {
      const wordSuggestionRes = await suggestNewWord({
        ...wordSuggestionData,
        tenses: Object.values(Tense).reduce((finalTenses, { value }) => ({
          ...finalTenses,
          [value]: '',
        }), {}),
      });
      expect(wordSuggestionRes.status).toEqual(200);
      expect(wordSuggestionRes.body.tenses[Tense.INFINITIVE.value]).toEqual('');
      const updatedWordSuggestionRes = await updateWordSuggestion({
        ...wordSuggestionRes.body,
        definitions: wordSuggestionRes.body.definitions
          .map((definitionGroup) => pick(definitionGroup, ['wordClass', 'definitions'])),
        tenses: {
          ...wordSuggestionRes.body.tenses,
          [Tense.IMPERATIVE.value]: 'testing',
        },
      });
      expect(updatedWordSuggestionRes.status).toEqual(200);
      expect(updatedWordSuggestionRes.body.tenses[Tense.IMPERATIVE.value]).toEqual('testing');
    });
  });

  describe('/GET mongodb wordSuggestions', () => {
    it('should return a word suggestion by searching', async () => {
      const keyword = wordSuggestionData.word;
      await suggestNewWord(wordSuggestionData);
      const res = await getWordSuggestions({ keyword });
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].word).toEqual(keyword);
    });

    it('should return a word suggestion by searching', async () => {
      const filter = wordSuggestionData.word;
      await suggestNewWord(wordSuggestionData);
      const res = await getWordSuggestions({ filter: { word: filter } });
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].word).toEqual(filter);
    });

    it('should return all word suggestions', async () => {
      await Promise.all([suggestNewWord(wordSuggestionData), suggestNewWord(wordSuggestionData)]);
      const res = await getWordSuggestions({ dialects: true, examples: true });
      expect(res.status).toEqual(200);
      expect(res.body.length).toBe(10);
      forEach(res.body, (wordSuggestion) => {
        WORD_SUGGESTION_KEYS.forEach((wordSuggestionKey) => {
          expect(wordSuggestion).toHaveProperty(wordSuggestionKey);
        });
      });
    });

    it('should be sorted by number of approvals', async () => {
      const wordSuggestionsRes = await Promise.all([
        suggestNewWord(wordSuggestionData),
        suggestNewWord(wordSuggestionApprovedData),
      ]);
      await approveWordSuggestion(wordSuggestionsRes[0]);
      const res = await getWordSuggestions();
      expect(res.status).toEqual(200);
      expectArrayIsInOrder(res.body, 'approvals', SortingDirections.DESCENDING);
    });

    it('should return one word suggestion', async () => {
      const res = await suggestNewWord(wordSuggestionData);
      const result = await getWordSuggestion(res.body.id);
      expect(result.status).toEqual(200);
      WORD_SUGGESTION_KEYS.forEach((wordSuggestionKey) => {
        expect(result.body).toHaveProperty(wordSuggestionKey);
      });
    });

    it('should return at most twenty five word suggestions per request with range query', async () => {
      const res = await Promise.all([
        getWordSuggestions({ range: true }),
        getWordSuggestions({ range: '[10,34]' }),
        getWordSuggestions({ range: '[35,59]' }),
      ]);
      expectUniqSetsOfResponses(res, 25);
    });

    it('should return at most four word suggestions per request with range query', async () => {
      const res = await getWordSuggestions({ range: '[5,8]' });
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeLessThanOrEqual(4);
    });

    it('should return at most thirty word suggestions because of a large range', async () => {
      const res = await getWordSuggestions({ range: '[10,39]' });
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeLessThanOrEqual(30);
    });

    it('should return at most ten word suggestions because of a tiny range', async () => {
      const res = await getWordSuggestions({ range: '[10,9]' });
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('should throw an error due to an invalid range', async () => {
      const res = await getWordSuggestions({ range: 'incorrect' });
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return at most ten word suggestions per request with range query', async () => {
      const res = await Promise.all([
        getWordSuggestions({ range: '[0,9]' }),
        getWordSuggestions({ range: '[10,19]' }),
        getWordSuggestions({ range: '[20,29]' }),
        getWordSuggestions({ range: [30, 39] }),
      ]);
      expectUniqSetsOfResponses(res);
    });

    it('should return different sets of word suggestions for pagination', async () => {
      const res = await Promise.all([
        getWordSuggestions({ page: 0 }),
        getWordSuggestions({ page: 1 }),
        getWordSuggestions({ page: 2 }),
      ]);
      expectUniqSetsOfResponses(res);
    });

    it('should return prioritize range over page', async () => {
      const res = await Promise.all([
        getWordSuggestions({ page: '1' }),
        getWordSuggestions({ page: '1', range: '[100,109]' }),
      ]);
      expect(isEqual(res[0].body, res[1].body)).toEqual(false);
    });

    it('should return a descending sorted list of word suggestions with sort query', async () => {
      const key = 'word';
      const direction = SortingDirections.DESCENDING;
      const res = await getWordSuggestions({ sort: `["${key}", "${direction}"]` });
      expect(res.status).toEqual(200);
      expectArrayIsInOrder(res.body, key, direction);
    });

    it('should return an ascending sorted list of word suggestions with sort query', async () => {
      const key = 'definitions';
      const direction = SortingDirections.ASCENDING;
      const res = await getWordSuggestions({ sort: `["${key}", "${direction}"]` });
      expect(res.status).toEqual(200);
      expectArrayIsInOrder(res.body, key, direction);
    });

    it('should throw an error due to malformed sort query', async () => {
      const key = 'wordClass';
      const res = await getWordSuggestions({ sort: `["${key}]` });
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should throw an error for providing an invalid id', async () => {
      const res = await getWordSuggestion(INVALID_ID);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });
  });

  describe('/DELETE mongodb wordSuggestions', () => {
    it('should delete a single word suggestion', async () => {
      const res = await suggestNewWord(wordSuggestionData);
      expect(res.status).toEqual(200);
      const result = await deleteWordSuggestion(res.body.id);
      expect(result.status).toEqual(200);
      expect(result.body.id).not.toEqual(undefined);
      const resError = await getWordSuggestion(result.body.id);
      expect(resError.status).toEqual(404);
      expect(resError.body.error).not.toEqual(undefined);
    });

    it('should return an error for attempting to deleting a non-existing word suggestion', async () => {
      const deleteRes = await deleteWordSuggestion(INVALID_ID);
      expect(deleteRes.status).toEqual(400);
    });

    it('should return error for non existent word suggestion', async () => {
      const res = await getWordSuggestion(wordSuggestionId);
      expect(res.status).toEqual(404);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should throw an error for providing an invalid id', async () => {
      const res = await deleteWordSuggestion(INVALID_ID);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should throw an error for deleting a suggestion that has been merged', async () => {
      const wordRes = await suggestNewWord(wordSuggestionData);
      expect(wordRes.status).toEqual(200);
      const res = await createWord(wordRes.body.id);
      const result = await deleteWordSuggestion(res.body.id);
      expect(result.status).toEqual(404);
      expect(result.body.error).not.toEqual(undefined);
    });
  });
});
