import { fetchUtils } from 'react-admin';
import restProvider from 'ra-data-simple-rest';
import { assign } from 'lodash';
import Collection from 'src/shared/constants/Collections';
import { createAuthorizationHeader } from 'src/shared/utils/request';
import { API_ROUTE } from '../shared/constants';
import authProvider from './authProvider';
import IndexedDBAPI from './IndexedDBAPI';

export const httpClient = async (
  url: string,
  options?: { headers?: any, method: string, body?: string },
): Promise<any | void> => {
  const updatedOptions = assign(options);
  try {
    if (!updatedOptions.headers) {
      updatedOptions.headers = new Headers({ Accept: 'application/json' });
    }
    const authToken = await createAuthorizationHeader();
    updatedOptions.headers.set('Authorization', authToken);
    const res = await fetchUtils.fetchJson(url, updatedOptions).catch((err) => err);

    if (res.status === 403) {
      console.error(`Unauthenticated to view resource: ${res.body?.error || ''}`);
      authProvider.logout();
    }
    return res;
  } catch (err) {
    return Promise.reject(err);
  }
};

export default {
  ...restProvider(API_ROUTE, httpClient),
  getOne: async (resource: Collection, params: any): Promise<{ data: any } | void> => (
    httpClient(`${API_ROUTE}/${resource}/${params.id}`).then(({ json }) => ({
      data: json,
    }))
  ),
  create: (resource: Collection, params: any): Promise<{ data: any } | void> => (
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
    })
  ),
  update: (resource: Collection, params: any): Promise<{ data: any } | void> => (
    httpClient(`${API_ROUTE}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(async ({ json, body }) => {
      if (!json) {
        throw body;
      }
      await IndexedDBAPI.putDocument({ resource, data: params.data });
      return { data: json };
    })
  ),
  delete: (resource: Collection, params: any): Promise<{ data: any } | void> => (
    httpClient(`${API_ROUTE}/${resource}/${params.id}`, {
      method: 'DELETE',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    }).then(async ({ json }) => {
      await IndexedDBAPI.deleteDocument({ resource, id: params.id });
      return { data: json };
    })
  ),
  deleteMany: (resource: Collection, params: any): Promise<{ data: any } | void> => (
    Promise.all(
      params.ids.map((id) => (
        httpClient(`${API_ROUTE}/${resource}/${id}`, {
          method: 'DELETE',
          headers: new Headers({
            'Content-Type': 'text/plain',
          }),
        })
          .then(async (res) => {
            await IndexedDBAPI.deleteDocument({ resource, id });
            return res;
          })
      )),
    ).then((responses) => ({
      data: responses.map(({ json }) => json.id),
    }))
  ),
};
