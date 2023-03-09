import { Record } from 'react-admin';
import IndexedDBAPI from 'src/utils/IndexedDBAPI';
import network from '../Core/Dashboard/network';
import type { Poll } from '../backend/shared/types/Poll';
import Collections from './constants/Collections';
import request from './utils/request';

const handleSubmitConstructedTermPoll = (poll: Poll) => (
  request({
    method: 'POST',
    url: 'twitter_poll',
    data: poll,
  })
);

export const getWord = async (id: string, { dialects } = { dialects: true }): Promise<any> => {
  const cachedWord = await IndexedDBAPI.getDocument({ resource: Collections.WORDS, id });
  if (cachedWord) {
    return cachedWord;
  }
  const { data: result } = await request({
    method: 'GET',
    url: `${Collections.WORDS}/${id}?dialects=${dialects}`,
  })
    .then(async (res) => {
      await IndexedDBAPI.putDocument({ resource: Collections.WORDS, data: res.data });
      return res;
    });
  return result;
};

export const getWords = async (word: string): Promise<any> => (await request({
  method: 'GET',
  url: `${Collections.WORDS}?keyword=${word}`,
})).data;

export const getWordSuggestions = async (word: string): Promise<any> => (await request({
  method: 'GET',
  url: `${Collections.WORD_SUGGESTIONS}?keyword=${word}`,
})).data;

export const getWordSuggestion = async (wordId: string): Promise<any> => (await request({
  method: 'GET',
  url: `${Collections.WORD_SUGGESTIONS}/${wordId}`,
})).data;

export const getExample = async (id: string): Promise<any> => {
  const cachedExample = await IndexedDBAPI.getDocument({ resource: Collections.EXAMPLES, id });
  if (cachedExample) {
    return cachedExample;
  }
  const { data: result } = await request({
    method: 'GET',
    url: `${Collections.EXAMPLES}/${id}`,
  })
    .then(async (res) => {
      await IndexedDBAPI.putDocument({ resource: Collections.EXAMPLES, data: res.data });
      return res;
    });
  return result;
};

export const getCorpus = async (id: string): Promise<any> => {
  const cachedCorpus = await IndexedDBAPI.getDocument({ resource: Collections.CORPORA, id });
  if (cachedCorpus) {
    return cachedCorpus;
  }
  const { data: result } = await request({
    method: 'GET',
    url: `${Collections.CORPORA}/${id}`,
  })
    .then(async (res) => {
      await IndexedDBAPI.putDocument({ resource: Collections.CORPORA, data: res.data });
      return res;
    });
  return result;
};

/**
 * Resolves either a word or word suggestion document
 */
export const resolveWord = async (wordId: string, isSuggestion: boolean): Promise<any> => {
  const resource = isSuggestion ? Collections.WORD_SUGGESTIONS : Collections.WORDS;
  const cachedWord = await IndexedDBAPI.getDocument({ resource, id: wordId });
  if (cachedWord) {
    return cachedWord;
  }
  const getDocument = isSuggestion ? getWordSuggestion : getWord;
  const wordRes = await getDocument(wordId, { dialects: true })
    .catch(async () => {
      /**
       * If there is a regular word string (not a MongoDB Id) then the platform
       * will search the Igbo API and find the matching word and insert
       * that word's id
       */

      const { json: wordsResults } = await network(`/${resource}?keyword=${wordId}`);
      const fallbackWord = wordsResults.find(({ word }) => word.normalize('NFD') === wordId.normalize('NFD'));
      return fallbackWord;
    });
  return wordRes;
};

export const getAssociatedExampleSuggestions = async (id: string): Promise<any> => (await request({
  method: 'GET',
  url: `${Collections.EXAMPLES}/${id}/exampleSuggestions`,
})).data;

export const getAssociatedWordSuggestions = async (id: string): Promise<any> => (await request({
  method: 'GET',
  url: `${Collections.WORDS}/${id}/wordSuggestions`,
})).data;

export const getAssociatedWordSuggestionByTwitterId = async (id: string): Promise<any> => (await request({
  method: 'GET',
  url: `${Collections.WORDS}/${id}/twitterPolls`,
})).data;

export const approveDocument = ({
  resource,
  record,
}: {
  resource: Collections,
  record: Record,
}): Promise<any> => request({
  method: 'PUT',
  url: `${resource}/${record.id}/approve`,
})
  .then(async ({ data }) => {
    await IndexedDBAPI.putDocument({ resource, data });
  });

export const denyDocument = ({
  resource,
  record,
}: {
  resource: Collections,
  record: Record,
}): Promise<any> => request({
  method: 'PUT',
  url: `${resource}/${record.id}/deny`,
})
  .then(async ({ data }) => {
    await IndexedDBAPI.putDocument({ resource, data });
  });

export const mergeDocument = ({
  resource,
  record,
}: {
  resource: Collections,
  record: Record,
}): Promise<any> => request({
  method: 'POST',
  url: `${resource}`,
  data: { id: record.id },
})
  .then(async (res) => {
    await Promise.all([
      IndexedDBAPI.putDocument({ resource, data: res.data }),
      IndexedDBAPI.deleteDocument({ resource: Collections.WORD_SUGGESTIONS, id: record.id }),
    ]);
    return res;
  });

export const deleteDocument = async (
  { resource, record }:
  { resource: Collections, record: Record },
): Promise<any> => request({
  method: 'DELETE',
  url: `${resource}/${record.id}`,
})
  .then(async () => {
    await IndexedDBAPI.deleteDocument({ resource, id: record.id });
  });

export const combineDocument = (
  { primaryWordId, resource, record }:
  { primaryWordId: string, resource: Collections, record: Record },
): Promise<any> => request({
  method: 'DELETE',
  url: `${resource}/${record.id}`,
  data: { primaryWordId },
})
  .then(async ({ data }) => {
    try {
      await Promise.all([
        IndexedDBAPI.deleteDocument({ resource, id: record.id }),
        IndexedDBAPI.putDocument({ resource, data }),
      ]);
    } catch (err) {
      console.log('IndexedDB error:', err.message);
    }
    return { data };
  });

export const submitConstructedTermPoll = (poll: Poll): Promise<any> => handleSubmitConstructedTermPoll(poll);
