import axios, { AxiosRequestConfig } from 'axios';
import { getAuth } from 'firebase/auth';
import { API_ROUTE } from '../constants/index';

const auth = getAuth();

export const createAuthorizationHeader = async (): Promise<string> => {
  const { currentUser } = auth;
  const accessToken = currentUser
    ? await currentUser.getIdToken()
    : localStorage.getItem('igbo-api-admin-access') || '';
  return `Bearer ${accessToken}`;
};

const createHeaders = async () => ({
  Authorization: await createAuthorizationHeader(),
});

export const request = async (requestObject: AxiosRequestConfig): Promise<any> => {
  const headers = await createHeaders();
  return axios.request({
    ...requestObject,
    url: `${API_ROUTE}/${requestObject.url}`,
    headers,
  });
};
