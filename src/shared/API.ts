import axios from 'axios';
import { omit } from 'lodash';
import { Record } from 'react-admin';
import IndexedDBAPI from 'src/utils/IndexedDBAPI';
import { EmptyResponse } from './server-validation';
import { useCallable } from '../hooks/useCallable';
import { API_ROUTE } from './constants/index';
import network from '../Core/Dashboard/network';
import type { Poll } from '../backend/shared/types/Poll';
import Collection from './constants/Collections';

const handleAssignUserToEditingGroup = (
  useCallable<{ groupNumber: string, uid: string }, EmptyResponse>('assignUserToEditingGroup')
);

const createAuthorizationHeader = () => {
  const accessToken = localStorage.getItem('igbo-api-admin-access') || '';
  return `Bearer ${accessToken}`;
};

const createHeaders = () => ({
  Authorization: createAuthorizationHeader(),
});

const request = (requestObject) => {
  const headers = createHeaders();
  return axios({ ...requestObject, headers });
};

const handleSubmitConstructedTermPoll = (poll: Poll) => (
  request({
    method: 'POST',
    url: `${API_ROUTE}/twitter_poll`,
    data: poll,
  })
);

export const getWord = async (id: string, { dialects } = { dialects: true }): Promise<any> => {
  const cachedWord = await IndexedDBAPI.getDocument({ resource: Collection.WORDS, id });
  if (cachedWord) {
    return cachedWord;
  }
  const { data: result } = await request({
    method: 'GET',
    url: `${API_ROUTE}/words/${id}?dialects=${dialects}`,
  })
    .then(async (res) => {
      await IndexedDBAPI.putDocument({ resource: Collection.WORDS, data: res.data });
      return res;
    });
  return result;
};

export const getWords = async (word: string): Promise<any> => (await request({
  method: 'GET',
  url: `${API_ROUTE}/words?keyword=${word}`,
})).data;

export const getWordSuggestions = async (word: string): Promise<any> => (await request({
  method: 'GET',
  url: `${API_ROUTE}/wordSuggestions?keyword=${word}`,
})).data;

export const getExample = async (id: string): Promise<any> => {
  const cachedExample = await IndexedDBAPI.getDocument({ resource: Collection.EXAMPLES, id });
  if (cachedExample) {
    return cachedExample;
  }
  const { data: result } = await request({
    method: 'GET',
    url: `${API_ROUTE}/examples/${id}`,
  })
    .then(async (res) => {
      await IndexedDBAPI.putDocument({ resource: Collection.EXAMPLES, data: res.data });
      return res;
    });
  return result;
};

export const getCorpus = async (id: string): Promise<any> => {
  const cachedCorpus = await IndexedDBAPI.getDocument({ resource: Collection.CORPORA, id });
  if (cachedCorpus) {
    return cachedCorpus;
  }
  const { data: result } = await request({
    method: 'GET',
    url: `${API_ROUTE}/corpora/${id}`,
  })
    .then(async (res) => {
      await IndexedDBAPI.putDocument({ resource: Collection.CORPORA, data: res.data });
      return res;
    });
  return result;
};

export const resolveWord = async (wordId: string): Promise<any> => {
  const cachedWord = await IndexedDBAPI.getDocument({ resource: Collection.WORDS, id: wordId });
  if (cachedWord) {
    return cachedWord;
  }
  const wordRes = await getWord(wordId, { dialects: true })
    .catch(async () => {
      /**
       * If there is a regular word string (not a MongoDB Id) then the platform
       * will search the Igbo API and find the matching word and insert
       * that word's id
       */

      const { json: wordsResults } = await network(`/words?keyword=${wordId}`);
      const fallbackWord = wordsResults.find(({ word }) => word.normalize('NFD') === wordId.normalize('NFD'));
      return fallbackWord;
    });
  return wordRes;
};

export const getAssociatedExampleSuggestions = async (id: string): Promise<any> => (await request({
  method: 'GET',
  url: `${API_ROUTE}/examples/${id}/exampleSuggestions`,
})).data;

export const getAssociatedWordSuggestions = async (id: string): Promise<any> => (await request({
  method: 'GET',
  url: `${API_ROUTE}/words/${id}/wordSuggestions`,
})).data;

export const getAssociatedWordSuggestionByTwitterId = async (id: string): Promise<any> => (await request({
  method: 'GET',
  url: `${API_ROUTE}/words/${id}/twitterPolls`,
})).data;

export const approveDocument = ({
  resource,
  record,
}: {
  resource: Collection,
  record: Record,
}): Promise<any> => request({
  method: 'PUT',
  url: `${API_ROUTE}/${resource}/${record.id}/approve`,
})
  .then(async ({ data }) => {
    await IndexedDBAPI.putDocument({ resource, data });
  });

export const denyDocument = ({
  resource,
  record,
}: {
  resource: Collection,
  record: Record,
}): Promise<any> => request({
  method: 'PUT',
  url: `${API_ROUTE}/${resource}/${record.id}/deny`,
})
  .then(async ({ data }) => {
    await IndexedDBAPI.putDocument({ resource, data });
  });

export const mergeDocument = ({
  resource,
  record,
}: {
  resource: Collection,
  record: Record,
}): Promise<any> => request({
  method: 'POST',
  url: `${API_ROUTE}/${resource}`,
  data: { id: record.id },
})
  .then(async ({ data }) => {
    await Promise.all([
      IndexedDBAPI.putDocument({ resource, data }),
      IndexedDBAPI.deleteDocument({ resource: Collection.WORD_SUGGESTIONS, id: record.id }),
    ]);
  });

export const deleteDocument = async (
  { resource, record }:
  { resource: Collection, record: Record },
): Promise<any> => request({
  method: 'DELETE',
  url: `${API_ROUTE}/${resource}/${record.id}`,
})
  .then(async () => {
    await IndexedDBAPI.deleteDocument({ resource, id: record.id });
  });

export const combineDocument = (
  { primaryWordId, resource, record }:
  { primaryWordId: string, resource: Collection, record: Record },
): Promise<any> => request({
  method: 'DELETE',
  url: `${API_ROUTE}/${resource}/${record.id}`,
  data: { primaryWordId },
})
  .then(async ({ data }) => {
    await Promise.all([
      IndexedDBAPI.deleteDocument({ resource, id: record.id }),
      IndexedDBAPI.putDocument({ resource, data }),
    ]);
  });

export const assignUserToEditingGroup = ({
  groupNumber,
  record,
} : {
  groupNumber: number | string,
  record: Record,
}): Promise<any> => {
  const { id: uid } = record;
  return handleAssignUserToEditingGroup({ groupNumber, uid });
};

export const submitConstructedTermPoll = (poll: Poll): Promise<any> => handleSubmitConstructedTermPoll(poll);

export const removePayloadFields = (payload: any): any => {
  const cleanedPayload = omit(payload, [
    'id',
    'updatedAt',
    'createdAt',
    'author',
    'authorEmail',
    'authorId',
    'merged',
    'mergedBy',
    'userInteractions',
    'media',
    'approvals',
    'denials',
    'hypernyms',
    'hyponyms',
    'duration',
    'twitterPollId',
  ]);
  if (Array.isArray(cleanedPayload.dialects)) {
    cleanedPayload.dialects.map((dialect) => omit(dialect, ['editor']));
  }
  return cleanedPayload;
};
