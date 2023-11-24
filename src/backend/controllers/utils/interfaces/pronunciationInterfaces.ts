import { Types } from 'mongoose';

export interface PronunciationData {
  audio: string;
  speaker: string;
  review: boolean;
  approvals: string[];
  denials: string[];
  archived: boolean;
}

export interface PronunciationSchema extends PronunciationData {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AudioPronunciation extends AudioPronunciationData, Document<any>, LeanDocument<any> {
  id: Types.ObjectId;
}

export interface AudioPronunciationData {
  id: Types.ObjectId | string;
  objectId: string;
  size: number;
  prevSize?: number;
  createdAt: Date;
  updatedAt: Date;
}
