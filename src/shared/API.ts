import axios from 'axios';
import { Record } from 'react-admin';
import { EmptyResponse } from './server-validation';
import { useCallable } from '../hooks/useCallable';
import { API_ROUTE } from './constants/index';
import network from '../Core/Dashboard/network';
import type { Poll } from '../backend/shared/types/Poll';

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

export const getWord = async (id: string, { dialects } = { dialects: true }): Promise<any> => (await request({
  method: 'GET',
  url: `${API_ROUTE}/words/${id}?dialects=${dialects}`,
})).data;

export const getExample = async (id: string): Promise<any> => (await request({
  method: 'GET',
  url: `${API_ROUTE}/examples/${id}`,
})).data;

export const resolveWord = (wordId: string): Promise<any> => network({ url: `/words/${wordId}` })
  .then(({ json: word }) => word)
  .catch(async () => {
    /**
     * If there is a regular word string (not a MongoDB Id) then the platform
     * will search the Igbo API and find the matching word and insert
     * that word's id
     */

    const { json: wordsResults } = await network({ url: `/words?keyword=${wordId}` });
    const fallbackWord = wordsResults.find(({ word }) => word.normalize('NFD') === wordId.normalize('NFD'));
    return fallbackWord;
  });

export const getAssociatedExampleSuggestions = async (id: string): Promise<any> => (await request({
  method: 'GET',
  url: `${API_ROUTE}/examples/${id}/exampleSuggestions`,
})).data;

export const getAssociatedWordSuggestions = async (id: string): Promise<any> => (await request({
  method: 'GET',
  url: `${API_ROUTE}/words/${id}/wordSuggestions`,
})).data;

export const approveDocument = ({ resource, record }: { resource: string, record: Record }): Promise<any> => request({
  method: 'PUT',
  url: `${API_ROUTE}/${resource}/${record.id}`,
  data: record,
});

export const denyDocument = ({ resource, record }: { resource: string, record: Record }): Promise<any> => request({
  method: 'PUT',
  url: `${API_ROUTE}/${resource}/${record.id}`,
  data: record,
});

export const mergeDocument = ({ collection, record }: { collection: string, record: Record }): Promise<any> => request({
  method: 'POST',
  url: `${API_ROUTE}/${collection}`,
  data: { id: record.id },
});

export const deleteDocument = async (
  { resource, record }:
  { resource: string, record: Record },
): Promise<any> => request({
  method: 'DELETE',
  url: `${API_ROUTE}/${resource}/${record.id}`,
});

export const combineDocument = (
  { primaryWordId, resource, record }:
  { primaryWordId: string, resource: string, record: Record },
): Promise<any> => request({
  method: 'DELETE',
  url: `${API_ROUTE}/${resource}/${record.id}`,
  data: { primaryWordId },
});

export const assignUserToEditingGroup = ({ groupNumber, record }): Promise<any> => {
  const { id: uid } = record;
  return handleAssignUserToEditingGroup({ groupNumber, uid });
};

export const submitConstructedTermPoll = (poll: Poll): Promise<any> => handleSubmitConstructedTermPoll(poll);
