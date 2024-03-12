import { Document } from 'mongoose';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';

export interface UserRanking {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  count: number;
  position: number;
}

export interface LeaderboardData {
  id: string;
  rankings: UserRanking[];
  type: LeaderboardType;
  page: number;
  updatedAt: Date;
}

export interface Leaderboard extends Document<LeaderboardData, any, any> {}
