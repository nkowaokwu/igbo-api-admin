import { Connection } from 'mongoose';
import { Request } from 'express';
import { UserRecord } from 'firebase-functions/v1/auth';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import { Suggestion } from 'src/backend/controllers/utils/interfaces/suggestionInterfaces';
import { Word } from 'src/backend/controllers/utils/interfaces/wordInterfaces';
import { ProjectData } from 'src/backend/controllers/utils/interfaces/projectInterfaces';

export interface HandleQueries {
  searchWord: string;
  regexKeyword: SearchRegExp;
  page: number;
  sort: { key: string; direction: string };
  skip: number;
  limit: number;
  filters: { [key: string]: string };
  user: EditorRequest['user'];
  strict: boolean;
  body: EditorRequest['body'];
  mongooseConnection: EditorRequest['mongooseConnection'];
  leaderboard?: LeaderboardType;
  timeRange?: LeaderboardTimeRange;
  uidQuery?: string;
  error?: any;
  response?: any;
  referralCode: string;
  params: Request['params'];
}

// @ts-expect-error EditorRequest
export interface EditorRequest extends Request {
  user: UserRecord & { role: UserRoles };
  query: {
    keyword?: string;
    page?: number | string;
    range?: string;
    sort?: string;
    filter?: string;
    strict?: string;
    uid?: string;
    leaderboard?: LeaderboardType;
    timeRange?: LeaderboardTimeRange;
    referralCode?: string;
    projectId?: string;
  };
  suggestionDoc?: Suggestion;
  body: any;
  word?: Word;
  response?: any;
  error?: Error;
  mongooseConnection: Connection;
  project: ProjectData;
}

export interface SearchRegExp {
  wordReg: RegExp;
  definitionsReg: RegExp;
}
