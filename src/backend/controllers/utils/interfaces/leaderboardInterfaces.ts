import { Document, LeanDocument, Types } from 'mongoose';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';

export interface UserRanking {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  count: number;
  position: number;
}

export interface Leaderboard extends Document<any>, LeanDocument<any> {
  id: Types.ObjectId;
  rankings: UserRanking[];
  type: LeaderboardType;
  page: number;
  updatedAt: Date;
}
