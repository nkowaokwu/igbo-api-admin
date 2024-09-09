import { DataProvider, fetchUtils } from 'react-admin';
import restProvider from 'ra-data-simple-rest';
import { assign } from 'lodash';
import Collection from 'src/shared/constants/Collection';
import { createAuthorizationHeader } from 'src/shared/utils/request';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import { API_ROUTE } from '../shared/constants';

export const generateUrlWithCustomQueryParams = (url: string): string => {
  const updatedUrl = url.includes('?') ? url : `${url}?`;
  return `${updatedUrl}&${new URLSearchParams({
    projectId: window.localStorage.getItem(LocalStorageKeys.PROJECT_ID),
  })}`;
};

export const httpClient = async <T>(
  url: string,
  options?: {
    headers?: any;
    method?: string;
    body?: BodyInit;
  },
): Promise<T> => {
  const updatedOptions = assign(options);
  try {
    if (!updatedOptions.headers) {
      updatedOptions.headers = new Headers({ Accept: 'application/json' });
    }
    const authToken = await createAuthorizationHeader();
    updatedOptions.headers.set('Authorization', authToken);
    const res = await fetchUtils.fetchJson(generateUrlWithCustomQueryParams(url), updatedOptions).catch((err) => err);

    if (res.status === 403) {
      console.error(`Unauthenticated to view resource: ${res.body?.error || ''}`);
    }
    return res;
  } catch (err) {
    return Promise.reject(err);
  }
};

export default {
  ...restProvider(API_ROUTE, httpClient),
  getOne: async (resource: Collection, params: any) =>
    httpClient(`${API_ROUTE}/${resource}/${params.id}`).then(({ json }) => ({
      data: json,
    })),
  create: (resource: Collection, params: any) =>
    httpClient(`${API_ROUTE}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json, body }) => {
      if (!json) {
        throw body;
      }
      return {
        data: { ...params.data, id: json.id },
      };
    }),
  update: (resource: Collection, params: any) =>
    httpClient(`${API_ROUTE}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(async ({ json, body }) => {
      if (!json) {
        throw body;
      }
      return { data: json };
    }),
  delete: (resource: Collection, params: any) =>
    httpClient(`${API_ROUTE}/${resource}/${params.id}`, {
      method: 'DELETE',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    }).then(async ({ json }) => ({ data: json })),
  deleteMany: (resource: Collection, params: any) =>
    Promise.all(
      params.ids.map((id) =>
        httpClient(`${API_ROUTE}/${resource}/${id}`, {
          method: 'DELETE',
          headers: new Headers({
            'Content-Type': 'text/plain',
          }),
        }),
      ),
    ).then((responses) => ({
      data: responses.map(({ json }) => json.id),
    })),
} as DataProvider;
