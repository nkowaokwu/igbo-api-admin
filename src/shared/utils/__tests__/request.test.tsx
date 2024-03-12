import axios from 'axios';
import { createAuthorizationHeader, request } from '../request';

describe('request', () => {
  it('creates a new authorizationHeader with createAuthorizationHeader', async () => {
    const response = await createAuthorizationHeader();

    expect(response).toEqual('Bearer user-access');
  });

  it('makes a request using axios to the backend', async () => {
    const response = new Promise((resolve) => resolve({ data: 'success' }));

    const requestSpy = jest.spyOn(axios, 'request').mockReturnValue(response);
    await request({ data: 'test data', url: 'test' });

    expect(requestSpy).toHaveBeenCalledWith({
      data: 'test data',
      url: 'https://localhost/test',
      headers: {
        Authorization: 'Bearer user-access',
      },
    });
  });

  it('makes a request using axios to the backend with no url', async () => {
    const response = new Promise((resolve) => resolve({ data: 'success' }));

    const requestSpy = jest.spyOn(axios, 'request').mockReturnValue(response);
    await request({ data: 'test data' });

    expect(requestSpy).toHaveBeenCalledWith({
      data: 'test data',
      url: 'https://localhost/undefined',
      headers: {
        Authorization: 'Bearer user-access',
      },
    });
  });
});
