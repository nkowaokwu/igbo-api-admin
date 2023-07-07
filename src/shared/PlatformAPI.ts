import { request } from './utils/request';

export type ReportUserInterface = {
  reportedDisplayName: string;
  reportedUid: string;
  reporterDisplayName: string;
  reporterUid: string;
  reason: string;
  details: string;
};

export const getPlatformStats = (): Promise<{ data: { hours: number; volunteers: number } }> =>
  request({
    method: 'GET',
    url: 'stats/login',
  });

export const sendReportUserEmail = (data: ReportUserInterface): Promise<any> =>
  request({
    method: 'POST',
    url: 'email/report',
    data,
  });
