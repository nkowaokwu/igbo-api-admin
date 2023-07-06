import { getPlatformStats, sendReportUserEmail } from 'src/shared/PlatformAPI';
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

  it('sends a POST request for sendReportUserEmail', async () => {
    const requestMock = jest
      .spyOn(requestUtils, 'request')
      .mockReturnValue(new Promise((resolve) => resolve({ data: { message: 'success' } })));
    const data = {
      reportedDisplayName: 'reportedDisplayName',
      reportedUid: 'reportedUid',
      reporterDisplayName: 'reporterDisplayName',
      reporterUid: 'reporterUid',
      reason: 'reason',
      details: 'details',
    };
    const res = await sendReportUserEmail(data);
    expect(requestMock).toBeCalledWith({
      method: 'POST',
      url: 'email/report',
      data,
    });
    expect(res).toEqual({
      data: {
        message: 'success',
      },
    });
  });
});
