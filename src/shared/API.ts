import axios from 'axios';
import { Record } from 'react-admin';
import { EmptyResponse } from './server-validation';
import { useCallable } from '../hooks/useCallable';
import { API_ROUTE } from './constants/index';

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

export const getWord = async (id: string, { dialects } = { dialects: true }): Promise<any> => (await request({
  method: 'get',
  url: `${API_ROUTE}/words/${id}?dialects=${dialects}`,
})).data;

export const getAssociatedExampleSuggestions = async (id: string): Promise<any> => (await request({
  method: 'get',
  url: `${API_ROUTE}/examples/${id}/exampleSuggestions`,
})).data;

export const getAssociatedWordSuggestions = async (id: string): Promise<any> => (await request({
  method: 'get',
  url: `${API_ROUTE}/words/${id}/wordSuggestions`,
})).data;

export const approveDocument = ({ resource, record }: { resource: string, record: Record }): Promise<any> => request({
  method: 'put',
  url: `${API_ROUTE}/${resource}/${record.id}`,
  data: record,
});

export const denyDocument = ({ resource, record }: { resource: string, record: Record }): Promise<any> => request({
  method: 'put',
  url: `${API_ROUTE}/${resource}/${record.id}`,
  data: record,
});

export const mergeDocument = ({ collection, record }: { collection: string, record: Record }): Promise<any> => request({
  method: 'post',
  url: `${API_ROUTE}/${collection}`,
  data: { id: record.id },
});

export const deleteDocument = async (
  { resource, record }:
  { resource: string, record: Record },
): Promise<any> => request({
  method: 'delete',
  url: `${API_ROUTE}/${resource}/${record.id}`,
});

export const combineDocument = (
  { primaryWordId, resource, record }:
  { primaryWordId: string, resource: string, record: Record },
): Promise<any> => request({
  method: 'delete',
  url: `${API_ROUTE}/${resource}/${record.id}`,
  data: { primaryWordId },
});

export const assignUserToEditingGroup = ({ groupNumber, record }): Promise<any> => {
  const { id: uid } = record;
  return handleAssignUserToEditingGroup({ groupNumber, uid });
};
