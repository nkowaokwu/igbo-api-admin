import { Document } from 'mongoose';
import StatTypes from 'src/backend/shared/constants/StatTypes';

export interface StatData {
  id: string;
  type: StatTypes;
  authorId: string;
  value: number;
}

export interface Stat extends Document<StatData, any, any> {}
