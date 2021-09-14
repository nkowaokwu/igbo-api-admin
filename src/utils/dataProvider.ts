import { fetchUtils } from 'react-admin';
import restProvider from 'ra-data-simple-rest';
import { assign } from 'lodash';
import { API_ROUTE } from '../shared/constants';

const httpClient = (url: string, options?: { headers: any }): Promise<any> => {
  const updatedOptions = assign(options);
  try {
    if (!updatedOptions.headers) {
      updatedOptions.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('igbo-api-admin-access') || '';
    updatedOptions.headers.set('Authorization', `Bearer ${token}`);
    return fetchUtils.fetchJson(url, updatedOptions);
  } catch (err) {
    return Promise.reject(err);
  }
};

export default restProvider(API_ROUTE, httpClient);
