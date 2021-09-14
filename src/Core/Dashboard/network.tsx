import { assign } from 'lodash';
import { fetchUtils } from 'react-admin';

export default (options) => {
  const updatedOptions = assign(options);
  try {
    if (!updatedOptions.headers) {
      updatedOptions.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('igbo-api-admin-access') || '';
    updatedOptions.headers.set('Authorization', `Bearer ${token}`);
    return fetchUtils.fetchJson(options.url, updatedOptions);
  } catch (err) {
    return Promise.reject(err);
  }
};
