import { fetchUtils } from 'react-admin';
import restProvider from 'ra-data-simple-rest';
import { assign } from 'lodash';
import Collection from 'src/shared/constants/Collections';
import { API_ROUTE } from '../shared/constants';
import authProvider from './authProvider';

export const httpClient = async (
  url: string,
  options?: { headers?: any, method: string, body: string },
): Promise<any | void> => {
  const updatedOptions = assign(options);
  try {
    if (!updatedOptions.headers) {
      updatedOptions.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('igbo-api-admin-access') || '';
    updatedOptions.headers.set('Authorization', `Bearer ${token}`);
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
};
