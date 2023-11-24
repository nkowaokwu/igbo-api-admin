import { Document, LeanDocument, Types } from 'mongoose';
import StatTypes from 'src/backend/shared/constants/StatTypes';

export interface Stat extends StatData, Document<any>, LeanDocument<any> {
  id: Types.ObjectId;
}

export interface StatData {
  id: Types.ObjectId | string;
  type: StatTypes;
  authorId: string;
  value: number;
}
