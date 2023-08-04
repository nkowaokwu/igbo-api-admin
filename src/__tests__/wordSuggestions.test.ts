import { forEach, forIn, isEqual, pick, times } from 'lodash';
import { ulid } from 'ulid'
import WordClass from 'src/backend/shared/constants/WordClass';
import Tense from 'src/backend/shared/constants/Tense';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import {
  approveWordSuggestion,
  deleteWordSuggestion,
  createWord,
  suggestNewWord,
  updateWordSuggestion,
  getWordSuggestions,
  getWordSuggestion,
  getExampleSuggestion,
  getExample,
  getRandomWordSuggestions,
  putRandomWordSuggestions,
} from './shared/commands';
import {
  wordSuggestionData,
  wordSuggestionWithoutIgboDefinitionsData,
  wordSuggestionApprovedData,
  malformedWordSuggestionData,
  updatedWordSuggestionData,
  wordSuggestionWithNestedExampleSuggestionData,
  wordSuggestionWithNestedMalformedExampleSuggestionData,
} from './__mocks__/documentData';
import { wordSuggestionId } from './__mocks__/documentIds';
import { WORD_SUGGESTION_KEYS, INVALID_ID, AUTH_TOKEN } from './shared/constants';
import { expectUniqSetsOfResponses, expectArrayIsInOrder } from './shared/utils';
import SortingDirections from '../backend/shared/constants/sortingDirections';

jest.unmock('aws-sdk');
jest.unmock('src/backend/controllers/utils/MediaAPIs/initializeAPI');
jest.unmock('src/backend/controllers/utils/MediaAPIs/utils');

describe('MongoDB Word Suggestions', () => {
  beforeAll(() => {
    jest.mock('src/backend/config', () => ({
      isAWSProduction: false,
      isCypress: false,
      TEST_MONGO_URI: 'mongodb://127.0.0.1:27017/test_igbo_api',
      AWS_BUCKET: 'test_bucket',
      AWS_REGION: 'test_region',
      AWS_ACCESS_KEY: 'test_access_key',
      AWS_SECRET_ACCESS_KEY: 'test_secret_access_key',
    }));
    jest.unmock('src/backend/controllers/utils/MediaAPIs/initializeAPI');
    jest.unmock('aws-sdk');
  });

  beforeEach(async () => {
    await dropMongoDBCollections();
    await Promise.all(
      times(5, async () => {
        await suggestNewWord({ ...wordSuggestionData, word: uuid() });
      }),
    );
  });

  describe('/POST mongodb wordSuggestions', () => {
    it('should save submitted word suggestion', async () => {
      const res = await suggestNewWord(wordSuggestionData);
      expect(res.status).toEqual(200);
      expect(res.body.id).not.toEqual(undefined);
      expect(res.body.frequency).toEqual(2);
    });

    it('should save submitted word suggestion with a nested example suggestion', async () => {
      const res = await suggestNewWord(wordSuggestionWithNestedExampleSuggestionData);
      expect(res.status).toEqual(200);
      expect(res.body.id).not.toEqual(undefined);
      expect(res.body.examples).toHaveLength(1);
    });

    it('should return a word error because of nested malformed example data', async () => {
      const res = await suggestNewWord(wordSuggestionWithNestedMalformedExampleSuggestionData);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return a word error because of malformed data', async () => {
      const res = await suggestNewWord(malformedWordSuggestionData);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return a word error because invalid id', async () => {
      const malformedData = { ...wordSuggestionData, originalWordId: 'ok123' };
      const res = await suggestNewWord(malformedData);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should throw an error because of invalid word class', async () => {
      const res = await suggestNewWord({
        ...wordSuggestionData,
        wordClass: 'invalid',
      });
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should persist author id to the dialects object', async () => {
      const res = await suggestNewWord({
        ...wordSuggestionData,
        dialects: [
          {
            word: 'dialect',
            variations: [],
            dialects: ['AFI'],
            pronunciation: '',
          },
        ],
      });
      expect(res.status).toEqual(200);
      expect(res.body.dialects[0].editor).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
    });

    it('should persist author id to the dialects object after adding and deleting dialect objects', async () => {
      const wordRes = await suggestNewWord({
        ...wordSuggestionData,
        dialects: [
          {
            word: 'dialect',
            variations: [],
            dialects: [DialectEnum.AFI],
            pronunciation: '',
          },
        ],
      });
      const secondWordRes = await updateWordSuggestion({
        ...wordRes.body,
        dialects: [
          ...wordRes.body.dialects,
          {
            word: 'dialect 2',
            variations: [],
            dialects: [DialectEnum.ABI],
            pronunciation: '',
          },
        ],
      });
      const thirdWordRes = await updateWordSuggestion(
        {
          ...secondWordRes.body,
          dialects: [
            ...secondWordRes.body.dialects,
            {
              word: 'dialect 3',
              variations: [],
              dialects: [DialectEnum.BON],
              pronunciation: '',
            },
          ],
        },
        { token: AUTH_TOKEN.MERGER_AUTH_TOKEN, cleanData: true },
      );
      expect(thirdWordRes.status).toEqual(200);
      expect(thirdWordRes.body.dialects[0].editor).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(thirdWordRes.body.dialects[1].editor).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(thirdWordRes.body.dialects[2].editor).toEqual(AUTH_TOKEN.MERGER_AUTH_TOKEN);
      const res = await updateWordSuggestion(
        {
          ...thirdWordRes.body,
          dialects: [
            ...thirdWordRes.body.dialects.map((dialect, index) => {
              if (!index) {
                dialect.word = 'updated first dialect';
              }
              return dialect;
            }),
          ],
        },
        { token: AUTH_TOKEN.MERGER_AUTH_TOKEN, cleanData: true },
      );
      expect(res.status).toEqual(200);
      expect(res.body.dialects[0].editor).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(res.body.dialects[1].editor).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(res.body.dialects[2].editor).toEqual(AUTH_TOKEN.MERGER_AUTH_TOKEN);
    });

    it('should throw an error by providing the editor id in payload', async () => {
      const res = await suggestNewWord(
        {
          ...wordSuggestionData,
          dialects: [
            {
              word: 'dialect',
              variations: [],
              dialects: ['AFI'],
              pronunciation: '',
              editor: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
            },
          ],
        },
        { cleanData: false },
      );
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
          const cleanedDefinitions = result.body[key].map((definitionGroup) =>
            pick(definitionGroup, ['wordClass', 'definitions']),
          );
          expect(isEqual(cleanedDefinitions, value)).toEqual(true);
        } else {
          expect(isEqual(result.body[key], value)).toEqual(true);
        }
      });
      expect(result.body.authorId).toEqual(res.body.authorId);
    });

    it('should update specific wordSuggestion with nested nsibidi', async () => {
      const res = await suggestNewWord(wordSuggestionData);
      expect(res.status).toEqual(200);
      const result = await updateWordSuggestion({
        id: res.body.id,
        ...updatedWordSuggestionData,
        definitions: [
          {
            definitions: ['first definition'],
            wordClass: WordClassEnum.NNC,
            nsibidi: 'testing',
          },
          ...updatedWordSuggestionData.definitions,
        ],
      });
      expect(result.body.nsibidi).toBeUndefined();
      expect(result.body.definitions[0].nsibidi).toBe('testing');
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

    it('should update a wordSuggestion without changing the nested exampleSuggestion audio data', async () => {
      const wordSuggestionBody = {
        ...wordSuggestionWithNestedExampleSuggestionData,
        examples: [
          {
            ...wordSuggestionWithNestedExampleSuggestionData.examples[0],
            pronunciations: [{ audio: 'data:audio/mp3recording audio', speaker: '' }],
          },
        ],
      };
      const wordRes = await suggestNewWord(wordSuggestionBody);
      expect(wordRes.status).toEqual(200);
      const nestedExampleId = wordRes.body.examples[0].id;
      expect(
        wordRes.body.examples[0].pronunciations[0].audio.startsWith(
          `https://igbo-api-test-local.com/audio-pronunciations/${nestedExampleId}-`,
        ),
      ).toBeTruthy();
      const secondWordRes = await updateWordSuggestion({
        ...wordRes.body,
        word: 'changed',
      });
      expect(secondWordRes.status).toEqual(200);
      expect(
        secondWordRes.body.examples[0].pronunciations[0].audio.startsWith(
          `https://igbo-api-test-local.com/audio-pronunciations/${nestedExampleId}-`,
        ),
      ).toBeTruthy();
      const res = await updateWordSuggestion({
        ...secondWordRes.body,
        examples: [
          {
            ...secondWordRes.body.examples[0],
            igbo: 'changed igbo',
          },
        ],
      });
      expect(res.status).toEqual(200);
      expect(res.body.word).toEqual('changed');
      expect(res.body.examples[0].igbo).toEqual('changed igbo');
      expect(
        res.body.examples[0].pronunciations[0].audio.startsWith(
          `https://igbo-api-test-local.com/audio-pronunciations/${nestedExampleId}-`,
        ),
      ).toBeTruthy();
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
      getExampleSuggestion(exampleSuggestionToDeleteId).end((_, noExampleSuggestionRes) => {
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

    it("should return an error because document doesn't exist", async () => {
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
        { ...wordRes.body, source: SuggestionSourceEnum.COMMUNITY },
        { cleanData: false },
      );
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
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
        definitions: wordSuggestionRes.body.definitions.concat({
          wordClass: WordClassEnum.AV,
          definitions: ['first verb'],
          igboDefinitions: [{ igbo: 'akwa', nsibidi: '' }],
        }),
      });
      expect(updatedWordSuggestionRes.body.definitions[0].wordClass).toEqual(
        wordSuggestionData.definitions[0].wordClass,
      );
      expect(
        isEqual(
          updatedWordSuggestionRes.body.definitions[0].definitions,
          wordSuggestionData.definitions[0].definitions,
        ),
      ).toEqual(true);
      expect(updatedWordSuggestionRes.body.definitions[1].wordClass).toEqual(WordClassEnum.AV);
      expect(isEqual(updatedWordSuggestionRes.body.definitions[1].definitions, ['first verb'])).toEqual(true);
      const updatedDefinitions = [...updatedWordSuggestionRes.body.definitions];
      updatedDefinitions.splice(0, 1);
      const finalWordSuggestionRes = await updateWordSuggestion(updatedWordSuggestionRes.body);
      expect(finalWordSuggestionRes.body.definitions[0].wordClass).toEqual(WordClassEnum.NNC);
      expect(isEqual(finalWordSuggestionRes.body.definitions[0].definitions, ['first'])).toEqual(true);
      expect(isEqual(finalWordSuggestionRes.body.definitions[1].igboDefinitions[0].igbo, 'akwa')).toEqual(true);
    });

    it('should create a word suggestion with tenses', async () => {
      const wordSuggestionRes = await suggestNewWord({
        ...wordSuggestionData,
        tenses: Object.values(Tense).reduce(
          (finalTenses, { value }) => ({
            ...finalTenses,
            [value]: '',
          }),
          {},
        ),
      });
      expect(wordSuggestionRes.status).toEqual(200);
      expect(wordSuggestionRes.body.tenses[Tense.INFINITIVE.value]).toEqual('');
      const updatedWordSuggestionRes = await updateWordSuggestion({
        ...wordSuggestionRes.body,
        definitions: wordSuggestionRes.body.definitions.map((definitionGroup) =>
          pick(definitionGroup, ['wordClass', 'definitions']),
        ),
        tenses: {
          ...wordSuggestionRes.body.tenses,
          [Tense.IMPERATIVE.value]: 'testing',
        },
      });
      expect(updatedWordSuggestionRes.status).toEqual(200);
      expect(updatedWordSuggestionRes.body.tenses[Tense.IMPERATIVE.value]).toEqual('testing');
    });

    it('should update a word suggestion with two different authors', async () => {
      const wordSuggestionRes = await suggestNewWord({
        ...wordSuggestionData,
        tenses: Object.values(Tense).reduce(
          (finalTenses, { value }) => ({
            ...finalTenses,
            [value]: '',
          }),
          {},
        ),
      });
      expect(wordSuggestionRes.status).toEqual(200);
      const updatedWordSuggestionRes = await updateWordSuggestion(
        {
          ...wordSuggestionRes.body,
          tenses: {
            ...wordSuggestionRes.body.tenses,
            [Tense.IMPERATIVE.value]: 'testing',
          },
          examples: [
            {
              igbo: 'testing with igbo',
              english: 'testing with english',
              pronunciations: [{ audio: 'data://', speaker: '' }],
            },
          ],
        },
        { token: AUTH_TOKEN.MERGER_AUTH_TOKEN, cleanData: true },
      );
      expect(updatedWordSuggestionRes.body.examples[0].authorId).toEqual(AUTH_TOKEN.MERGER_AUTH_TOKEN);
      expect(updatedWordSuggestionRes.body.authorId).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      const res = await updateWordSuggestion(
        {
          ...updatedWordSuggestionRes.body,
          tenses: {
            ...wordSuggestionRes.body.tenses,
            [Tense.IMPERATIVE.value]: 'testing',
          },
          examples: [
            {
              igbo: 'testing with igbo updated',
              english: 'testing with english updated',
              id: updatedWordSuggestionRes.body.examples[0].id,
            },
          ],
        },
        { token: AUTH_TOKEN.ADMIN_AUTH_TOKEN, cleanData: true },
      );
      expect(res.body.examples[0].authorId).toEqual(AUTH_TOKEN.MERGER_AUTH_TOKEN);
      expect(res.body.authorId).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      await createWord(res.body.id);
      const exampleSuggestionRes = await getExampleSuggestion(res.body.examples[0].id);
      const exampleRes = await getExample(exampleSuggestionRes.body.merged);
      expect(exampleSuggestionRes.body.merged).toEqual(exampleRes.body.id);
      expect(exampleSuggestionRes.body.mergedBy).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(exampleSuggestionRes.body.authorId).toEqual(AUTH_TOKEN.MERGER_AUTH_TOKEN);
    });

    it('should update a word suggestion with an nsibidi character', async () => {
      const wordSuggestionRes = await suggestNewWord(wordSuggestionData);
      expect(wordSuggestionRes.status).toEqual(200);
      expect(wordSuggestionRes.body.definitions[0].nsibidiCharacters[0]).toEqual(
        wordSuggestionData.definitions[0].nsibidiCharacters[0].toString(),
      );
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
      await Promise.all(times(5, async () => suggestNewWord(wordSuggestionData)));
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
      const result = await getWordSuggestion(res.body.id, { examples: true });
      expect(result.status).toEqual(200);
      WORD_SUGGESTION_KEYS.filter((key) => key !== 'examples').forEach((wordSuggestionKey) => {
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
        getWordSuggestions({ page: '0' }),
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

  describe('Nsibidi Characters', () => {
    it('should include nsibidiCharacters in nested example suggestion', async () => {
      const wordRes = await suggestNewWord({
        ...wordSuggestionData,
        examples: [
          {
            igbo: 'igbo',
            english: 'english',
            nsibidiCharacters: [],
            nsibidi: 'a',
          },
        ],
      });
      expect(wordRes.status).toEqual(200);
      expect(wordRes.body.examples[0].nsibidiCharacters).toHaveLength(0);
    });
  });

  describe('Igbo Definitions', () => {
    it('should get five random word suggestions with no user interactions associated with user', async () => {
      await Promise.all(
        times(5, async () => {
          const wordRes = await suggestNewWord(
            { ...wordSuggestionData, word: ulid() },
            { token: AUTH_TOKEN.MERGER_AUTH_TOKEN },
          );
          expect(wordRes.body.approvals).toHaveLength(0);
          expect(wordRes.body.denials).toHaveLength(0);
        }),
      );
      const res = await getRandomWordSuggestions({});
      expect(res.status).toEqual(200);
      expect(res.body.length).toBeLessThanOrEqual(5);
      res.body.forEach((wordSuggestion) => {
        expect(wordSuggestion.definitions[0].igboDefinitions[0]).toBeUndefined();
      });
    });

    it('should save the Igbo definitions for each word suggestion with no duplicates', async () => {
      await Promise.all(
        times(5, async () => {
          const wordRes = await suggestNewWord(

            { ...wordSuggestionWithoutIgboDefinitionsData, word: uuid() },
            { token: AUTH_TOKEN.MERGER_AUTH_TOKEN },
          );
          expect(wordRes.body.approvals).toHaveLength(0);
          expect(wordRes.body.denials).toHaveLength(0);
        }),
      );
      const randomRes = await getRandomWordSuggestions({});
      expect(randomRes.status).toEqual(200);
      expect(randomRes.body.length).toBeGreaterThanOrEqual(5);
      const igboDefinitions = randomRes.body.map((wordSuggestion) => ({
        id: wordSuggestion.id,
        igboDefinition: wordSuggestion.word,
      }));
      const res = await putRandomWordSuggestions(igboDefinitions);
      expect(res.status).toEqual(200);
      await Promise.all(
        res.body.map(async (wordSuggestionId) => {
          const updatedWordRes = await getWordSuggestion(wordSuggestionId);
          const currentIgboDefinition = igboDefinitions.find(({ id }) => id === wordSuggestionId).igboDefinition;
          expect(updatedWordRes.body.definitions[0].igboDefinitions[0].igbo).toEqual(currentIgboDefinition);
          const singleWordRes = await getWordSuggestions({ keyword: currentIgboDefinition });
          expect(singleWordRes.status).toEqual(200);
          expect(singleWordRes.body).toHaveLength(1);
        }),
      );
    });

    it('should silently fail if an invalid word suggestion id is provided', async () => {
      await Promise.all(
        times(5, async () => {
          const wordRes = await suggestNewWord(
            { ...wordSuggestionWithoutIgboDefinitionsData, word: uuid() },
            { token: AUTH_TOKEN.MERGER_AUTH_TOKEN },
          );
          expect(wordRes.body.approvals).toHaveLength(0);
          expect(wordRes.body.denials).toHaveLength(0);
        }),
      );
      const randomRes = await getRandomWordSuggestions();
      expect(randomRes.status).toEqual(200);
      expect(randomRes.body.length).toBeGreaterThanOrEqual(5);
      const igboDefinitions = randomRes.body.map((wordSuggestion, index) => ({
        id: !index ? wordSuggestionId : wordSuggestion.id,
        igboDefinition: wordSuggestion.word,
      }));
      const res = await putRandomWordSuggestions(igboDefinitions);
      expect(res.status).toEqual(200);
      console.log(res.body);
      expect(res.body.length).toEqual(4);
      await Promise.all(
        res.body.map(async (id, index) => {
          if (!index) {
            expect(res.body.find((id) => id === wordSuggestionId)).toBeFalsy();
            const nonExistentRes = await getWordSuggestion(wordSuggestionId);
            expect(nonExistentRes.status).toEqual(404);
            return;
          }
          const updatedWordRes = await getWordSuggestion(id);
          const currentIgboDefinition = igboDefinitions.find(
            ({ id: igboDefinitionId }) => igboDefinitionId === id,
          ).igboDefinition;
          expect(updatedWordRes.body.definitions[0].igboDefinitions[0].igbo).toEqual(currentIgboDefinition);
          const singleWordRes = await getWordSuggestions({ keyword: currentIgboDefinition });
          expect(singleWordRes.status).toEqual(200);
          expect(singleWordRes.body).toHaveLength(1);
        }),
      );
    });

    it('should fail because of invalid igbo definitions payload shape', async () => {
      const res = await putRandomWordSuggestions([
        // @ts-expect-error
        { igboDefinition: 'invalid without id' },
        { id: wordSuggestionId.toString(), igboDefinition: 'valid with id' },
      ]);
      expect(res.status).toEqual(400);
      expect(res.body).toEqual({ error: '"[0].id" is required' });
    });
  });
});
