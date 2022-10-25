import {
  forIn,
  isEqual,
  uniqBy,
  some,
} from 'lodash';
import moment from 'moment';
import WordClass from 'src/shared/constants/WordClass';
import {
  INVALID_ID,
  MESSAGE,
  INVALID_MESSAGE,
  AUTH_TOKEN,
} from './shared/constants';
import {
  exampleSuggestionData,
  wordSuggestionData,
  updatedWordData,
  updatedWordSuggestionData,
} from './__mocks__/documentData';
import {
  getWords,
  getWord,
  getWordSuggestion,
  getWordSuggestions,
  createWord,
  deleteWord,
  updateWord,
  suggestNewWord,
  sendSendGridEmail,
  updateWordSuggestion,
  getExample,
} from './shared/commands';
import { createWordFromSuggestion, createExampleFromSuggestion } from './shared/utils';

describe('MongoDB Words', () => {
  /* Create a base wordSuggestion document */
  beforeAll(async () => {
    await suggestNewWord(wordSuggestionData);
  });
  describe('/POST mongodb words', () => {
    it('should create a new word in the database by merging wordSuggestion', async () => {
      const res = await suggestNewWord(updatedWordSuggestionData);
      expect(res.status).toEqual(200);
      const mergingWordSuggestion = { ...res.body, ...updatedWordSuggestionData };
      const result = await createWord(mergingWordSuggestion.id);
      expect(result.status).toEqual(200);
      expect(result.body.id).not.toEqual(undefined);
      expect(result.body.authorId).toEqual(undefined);
      const updatedWordRes = await getWord(result.body.id);
      expect(updatedWordRes.status).toEqual(200);
      const wordRes = await getWordSuggestion(res.body.id);
      expect(wordRes.status).toEqual(200);
      expect(wordRes.body.mergedBy).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(updatedWordRes.body.word).toEqual(wordRes.body.word);
      expect(updatedWordRes.body.wordClass).toEqual(wordRes.body.wordClass);
      expect(updatedWordRes.body.id).toEqual(wordRes.body.merged);
    });

    it('should merge into an existing word with new wordSuggestion', async () => {
      const res = await suggestNewWord(wordSuggestionData);
      expect(res.status).toEqual(200);
      const wordRes = await getWords();
      const firstWord = wordRes.body[0];
      const mergingWordSuggestion = { ...res.body, originalExampleId: firstWord.id };
      const result = await createWord(mergingWordSuggestion.id);
      expect(result.status).toEqual(200);
      expect(result.body.id).not.toEqual(undefined);
      expect(result.body.authorId).toEqual(undefined);
      const updatedWordRes = await getWord(result.body.id);
      expect(updatedWordRes.status).toEqual(200);
      const updatedWordSuggestionRes = await getWordSuggestion(res.body.id);
      expect(updatedWordRes.status).toEqual(200);
      expect(updatedWordSuggestionRes.body.mergedBy).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(updatedWordRes.body.word).toEqual(updatedWordSuggestionRes.body.word);
      expect(updatedWordRes.body.wordClass).toEqual(updatedWordSuggestionRes.body.wordClass);
      expect(updatedWordRes.body.id).toEqual(updatedWordSuggestionRes.body.merged);
    });

    it('should merge into an existing word with existing wordSuggestion', async () => {
      const res = await getWordSuggestions();
      expect(res.status).toEqual(200);
      const firstWordSuggestion = res.body[0];
      firstWordSuggestion.wordClass = WordClass.ADJ.value;
      const updatedWordSuggestionRes = await updateWordSuggestion(firstWordSuggestion);
      expect(updatedWordSuggestionRes.status).toEqual(200);
      const wordRes = await createWord(updatedWordSuggestionRes.body.id);
      expect(wordRes.status).toEqual(200);
      expect(wordRes.body.word).toEqual(updatedWordSuggestionRes.body.word);
      expect(wordRes.body.wordClass).toEqual(updatedWordSuggestionRes.body.wordClass);
      const wordSuggestionRes = await getWordSuggestion(updatedWordSuggestionRes.body.id);
      expect(wordSuggestionRes.status).toEqual(200);
      expect(wordSuggestionRes.body.mergedBy).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(wordSuggestionRes.body.merged).toEqual(wordRes.body.id);
    });

    it('should send an email with valid message object', async () => {
      sendSendGridEmail(MESSAGE);
    });

    it('should return an error with invalid message object', async () => {
      await sendSendGridEmail(INVALID_MESSAGE).catch(() => null);
    });

    it('should return a newly created word after merging with just an id', async () => {
      const res = await suggestNewWord(wordSuggestionData);
      const result = await createWord(res.body.id);
      expect(result.status).toEqual(200);
      expect(result.body.error).toEqual(undefined);
    });

    it('should return newly created word by searching with keyword', async () => {
      const res = await suggestNewWord(wordSuggestionData);
      const mergingWordSuggestion = { ...res.body, ...wordSuggestionData };
      const result = await createWord(mergingWordSuggestion.id);
      expect(result.status).toEqual(200);
      expect(result.body.id).not.toEqual(undefined);
      const wordRes = await getWords({ keyword: wordSuggestionData.word });
      expect(wordRes.status).toEqual(200);
      expect(some(wordRes.body, (word) => word.word === mergingWordSuggestion.word)).toEqual(true);
    });
  });

  describe('/PUT mongodb words', () => {
    it('should create a new word and update it', async () => {
      const res = await suggestNewWord(wordSuggestionData);
      const mergingWordSuggestion = { ...res.body, ...wordSuggestionData };
      const result = await createWord(mergingWordSuggestion.id);
      expect(result.status).toEqual(200);
      expect(result.body.id).not.toEqual(undefined);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const updateWordRes = await updateWord({ id: result.body.id, ...updatedWordData });
      expect(updateWordRes.status).toEqual(200);
      forIn(updatedWordData, (value, key) => {
        expect(isEqual(updateWordRes.body[key], value)).toEqual(true);
        expect(moment(result.body.updatedAt).unix())
          .toBeLessThan(moment(updateWordRes.body.updatedAt).unix());
      });
    });
  });

  describe('/DELETE mongodb words', () => {
    it('should delete the word document and move its contents to a new word with associated examples', async () => {
      const firstWord = await createWordFromSuggestion(updatedWordSuggestionData);
      const firstExample = await createExampleFromSuggestion({
        ...exampleSuggestionData,
        associatedWords: [firstWord.id],
      });
      const secondWord = await createWordFromSuggestion({ ...updatedWordSuggestionData, word: 'combine into word' });
      const secondExample = await createExampleFromSuggestion({
        ...exampleSuggestionData,
        associatedWords: [firstWord.id, secondWord.id],
      });
      expect([null, undefined, '']).not.toContain(firstWord.id);
      expect([null, undefined, '']).not.toContain(secondWord.id);
      const combinedWordRes = await deleteWord(firstWord.id, secondWord.id);
      const { definitions, variations, stems } = combinedWordRes.body;
      expect(combinedWordRes.status).toEqual(200);
      expect(isEqual(definitions, uniqBy(definitions, (definition) => definition))).toEqual(true);
      expect(isEqual(variations, uniqBy(variations, (variation) => variation))).toEqual(true);
      expect(isEqual(stems, uniqBy(stems, (stem) => stem))).toEqual(true);
      expect(isEqual(definitions, firstWord.definitions)).toBeTruthy();
      expect(isEqual(definitions, secondWord.definitions)).toBeTruthy();
      expect(isEqual(variations, firstWord.variations)).toBeTruthy();
      expect(isEqual(variations, secondWord.variations)).toBeTruthy();
      expect(isEqual(stems, firstWord.stems)).toBeTruthy();
      expect(isEqual(stems, secondWord.stems)).toBeTruthy();
      const firstExampleRes = await getExample(firstExample.id);
      expect(firstExampleRes.status).toEqual(200);
      const secondExampleRes = await getExample(secondExample.id);
      const { associatedWords: firstExampleAssociatedWords } = firstExampleRes.body;
      const { associatedWords: secondExampleAssociatedWords } = secondExampleRes.body;
      expect(secondExampleRes.status).toEqual(200);
      expect(firstExampleRes.body.associatedWords).toContain(combinedWordRes.body.id);
      expect(firstExampleRes.body.associatedWords).not.toContain(firstWord.id);
      expect(secondExampleRes.body.associatedWords).toContain(combinedWordRes.body.id);
      expect(secondExampleRes.body.associatedWords).not.toContain(firstWord.id);
      expect(isEqual(
        firstExampleAssociatedWords,
        uniqBy(firstExampleAssociatedWords, (associatedWord) => associatedWord),
      )).toEqual(true);
      expect(isEqual(
        secondExampleAssociatedWords,
        uniqBy(secondExampleAssociatedWords, (associatedWord) => associatedWord),
      )).toEqual(true);
      const res = await getWord(firstWord.id);
      expect(res.status).toEqual(404);
    });

    it('should return an error deleting a word with an invalid primary word id', async () => {
      const firstWord = await createWordFromSuggestion(updatedWordSuggestionData);
      expect([null, undefined, '']).not.toContain(firstWord.id);
      const combinedWordRes = await deleteWord(firstWord.id, INVALID_ID);
      expect(combinedWordRes.status).toEqual(400);
      expect([null, undefined, '']).not.toContain(combinedWordRes.body.error);
    });

    it('should return an error deleting a word with an invalid secondary word id', async () => {
      const firstWord = await createWordFromSuggestion(updatedWordSuggestionData);
      expect([null, undefined, '']).not.toContain(firstWord.id);
      const combinedWordRes = await deleteWord(INVALID_ID, firstWord.id);
      expect(combinedWordRes.status).toEqual(400);
      expect([null, undefined, '']).not.toContain(combinedWordRes.body.error);
    });

    it('should handle a word with a null stems field', async () => {
      const wordsRes = await getWords({ range: '[0, 24]' });
      expect(wordsRes.status).toEqual(200);
      const wordWithNullStems = wordsRes.body[0];
      const firstWord = await createWordFromSuggestion({ ...updatedWordSuggestionData, stems: null });
      const combinedWordRes = await deleteWord(firstWord.id.toString(), wordWithNullStems.id);
      const { definitions, variations, stems } = combinedWordRes.body;
      expect(combinedWordRes.status).toEqual(200);
      expect(isEqual(definitions, uniqBy(definitions, (definition) => definition))).toEqual(true);
      expect(isEqual(variations, uniqBy(variations, (variation) => variation))).toEqual(true);
      expect(isEqual(stems, uniqBy(stems, (stem) => stem))).toEqual(true);
      expect(isEqual(definitions, firstWord.definitions)).toBeTruthy();
      expect(isEqual(definitions, wordWithNullStems.definitions)).toBeTruthy();
      expect(isEqual(variations, firstWord.variations)).toBeTruthy();
      expect(isEqual(variations, wordWithNullStems.variations)).toBeTruthy();
      expect(stems).toHaveLength(0);
      expect(firstWord.stems).toBe(null);
      expect(wordWithNullStems.stems).toHaveLength(0);
    });

    it('should delete all wordSuggestions that are associated with the combined word', async () => {
      const word = await createWordFromSuggestion(updatedWordSuggestionData);
      const wordSuggestionRes = await suggestNewWord({ ...wordSuggestionData, originalWordId: word.id });
      const secondWordSuggestionRes = await suggestNewWord({ ...wordSuggestionData, originalWordId: word.id });
      expect(wordSuggestionRes.status).toEqual(200);
      const secondWord = await createWordFromSuggestion(updatedWordSuggestionData);
      const thirdWordSuggestionRes = await suggestNewWord({ ...wordSuggestionData, originalWordId: secondWord.id });
      const combinedWordRes = await deleteWord(word.id, secondWord.id);
      expect(combinedWordRes.status).toEqual(200);
      const firstNonExistentWordSuggestionRes = await getWordSuggestion(wordSuggestionRes.body.id);
      expect(firstNonExistentWordSuggestionRes.status).toEqual(404);
      const secondNonExistentWordSuggestionRes = await getWordSuggestion(secondWordSuggestionRes.body.id);
      expect(secondNonExistentWordSuggestionRes.status).toEqual(404);
      const thirdExistentWordSuggestionRes = await getWordSuggestion(thirdWordSuggestionRes.body.id);
      expect(thirdExistentWordSuggestionRes.status).toEqual(200);
      expect(thirdExistentWordSuggestionRes.body.id).not.toEqual(undefined);
    });
  });
});
