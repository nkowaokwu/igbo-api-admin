import { getPlatformStats } from 'src/shared/PlatformAPI';
import * as requestUtils from '../utils/request';

describe('PlatformAPI', () => {
  it('sends a GET request for getPlatformStats', async () => {
    const requestMock = jest
      .spyOn(requestUtils, 'request')
      .mockReturnValue(new Promise((resolve) => resolve({ data: { volunteers: 1, hours: 100 } })));
    const res = await getPlatformStats();
    expect(requestMock).toBeCalledWith({
      method: 'GET',
      url: 'stats/login',
    });
    expect(res).toEqual({
      data: {
        volunteers: 1,
        hours: 100,
      },
    });
  });
});
