import axios from 'axios';
import { API_ROUTE } from '../shared/constants';

const getWord = (word: string): Promise<any> => {
  const token = localStorage.getItem('igbo-api-admin-access') || '';
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
  try {
    return axios({
      method: 'get',
      url: `${API_ROUTE}/words/?keyword=${word}`,
      headers,
    })
      .then((res) => res.data);
  } catch (err) {
    return Promise.reject(err);
  }
};

export default getWord;
