import { assign } from 'lodash';
import { fetchUtils } from 'react-admin';

export default async (options: { url: string, headers?: Headers }): Promise<any> => {
  const updatedOptions = assign(options);
  try {
    if (!updatedOptions.headers) {
      updatedOptions.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('igbo-api-admin-access') || '';
    updatedOptions.headers.set('Authorization', `Bearer ${token}`);
    const res = await fetchUtils.fetchJson(options.url, updatedOptions);
    if (res.status === 403) {
      throw new Error('Unauthenticated to view resource');
    }
    return res;
  } catch (err) {
    return Promise.reject(err);
  }
};
