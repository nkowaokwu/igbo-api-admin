import { omit } from 'lodash';
import {
  createWord,
  deleteWordSuggestion,
  getExample,
  getWord,
  getWordSuggestion,
  getExampleSuggestion,
  suggestNewWord,
  suggestNewExample,
  updateWordSuggestion,
} from './shared/commands';
import {
  exampleSuggestionData,
  wordSuggestionData,
  wordSuggestionWithNestedExampleSuggestionData,
} from './__mocks__/documentData';
import { AUTH_TOKEN, SAVE_DOC_DELAY } from './shared/constants';
import { createExampleFromSuggestion } from './shared/utils';

describe('Editing Flow', () => {
  it('should create a new wordSuggestion and then merge', async () => {
    const wordSuggestionRes = await suggestNewWord(wordSuggestionData);
    expect(wordSuggestionRes.status).toEqual(200);
    const mergedWordRes = await createWord(wordSuggestionRes.body.id);
    expect(mergedWordRes.status).toEqual(200);
    const res = await getWordSuggestion(wordSuggestionRes.body.id);
    expect(res.status).toEqual(200);
    expect(res.body.mergedBy).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
    expect(res.body.merged).toEqual(mergedWordRes.body.id);
  });

  it('should throw an error for invalid data while creating a wordSuggestion', async () => {
    const wordSuggestionRes = await suggestNewWord({ ...wordSuggestionData, definitions: [] });
    expect(wordSuggestionRes.status).toEqual(400);
  });

  it('should create a new wordSuggestion with a nested exampleSuggestion then merge', async () => {
    const suggestionRes = await suggestNewWord(wordSuggestionWithNestedExampleSuggestionData);
    expect(suggestionRes.status).toEqual(200);
    const mergedWordRes = await createWord(suggestionRes.body.id);
    expect(mergedWordRes.status).toEqual(200);
    await new Promise((resolve) => setTimeout(resolve, SAVE_DOC_DELAY));
    const wordRes = await getWord(mergedWordRes.body.id);
    const mergedWord = wordRes.body;
    const nestedExample = mergedWord.examples[0];
    const exampleRes = await getExample(nestedExample.id);
    const wordSuggestionRes = await getWordSuggestion(suggestionRes.body.id);
    const mergedExample = exampleRes.body;
    const wordSuggestion = wordSuggestionRes.body;
    expect(mergedExample.associatedWords).toContain(mergedWord.id);
    expect(wordSuggestion.mergedBy).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
    expect(wordSuggestion.merged).toEqual(mergedWord.id);
    expect(mergedWord.examples[0].associatedWords).toContain(mergedWord.id);
    expect(mergedWord.examples[0].id).toEqual(mergedExample.id);
  });

  it('should add a new associatedWordId to exampleSuggestion', async () => {
    const res = await suggestNewWord(wordSuggestionData);
    const firstWordRes = await createWord(res.body.id);
    expect(firstWordRes.status).toEqual(200);
    const wordSuggestionRes = await suggestNewWord(wordSuggestionWithNestedExampleSuggestionData);
    expect(wordSuggestionRes.status).toEqual(200);
    const mergedWordRes = await createWord(wordSuggestionRes.body.id);
    expect(mergedWordRes.status).toEqual(200);
    const wordRes = await getWord(mergedWordRes.body.id);
    expect(wordRes.status).toEqual(200);
    const example = wordRes.body.examples[0];
    const newExampleSuggestion = omit({
      ...example,
      associatedWords: [...example.associatedWords, firstWordRes.body.id],
    }, ['id']);
    await createExampleFromSuggestion(newExampleSuggestion);
  });

  it('should throw an error for duplicate associated words', async () => {
    const wordSuggestionRes = await suggestNewWord(wordSuggestionData);
    const exampleData = {
      ...exampleSuggestionData,
      associatedWords: [wordSuggestionRes.body.id, wordSuggestionRes.body.id],
    };
    const exampleSuggestionRes = await suggestNewExample(exampleData);
    expect(exampleSuggestionRes.status).toEqual(400);
  });

  it('should delete a new wordSuggestion with a nested exampleSuggestions', async () => {
    const wordSuggestionRes = await suggestNewWord(wordSuggestionWithNestedExampleSuggestionData);
    expect(wordSuggestionRes.status).toEqual(200);
    const nestedExampleSuggestion = wordSuggestionRes.body.examples[0];
    const deleteWordSuggestionRes = await deleteWordSuggestion(wordSuggestionRes.body.id);
    expect(deleteWordSuggestionRes.status).toEqual(200);
    const res = await getWordSuggestion(wordSuggestionRes.body.id);
    expect(res.status).toEqual(404);
    expect(res.body.error).not.toEqual(undefined);
    const result = await getExampleSuggestion(nestedExampleSuggestion.id);
    expect(result.status).toEqual(404);
    expect(result.body.error).not.toEqual(undefined);
  });

  it('should update wordSuggestion with nested exampleSuggestions', async () => {
    const wordSuggestionRes = await suggestNewWord(wordSuggestionWithNestedExampleSuggestionData);
    expect(wordSuggestionRes.status).toEqual(200);
    const updatedWordSuggestion = {
      ...wordSuggestionRes.body,
      definitions: wordSuggestionRes.body.definitions.map((definitionGroup) => omit(definitionGroup, ['id'])),
      word: 'newWord',
    };
    const res = await updateWordSuggestion(updatedWordSuggestion);
    expect(res.status).toEqual(200);
    expect(res.body.word).toEqual('newWord');
  });
});
