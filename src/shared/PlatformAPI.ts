import { request } from './utils/request';

export const getPlatformStats = (): Promise<{ data: { hours: number; volunteers: number } }> =>
  request({
    method: 'GET',
    url: 'stats/login',
  });
