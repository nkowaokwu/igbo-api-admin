import { Document } from 'mongoose';

export interface PronunciationData {
  audio: string;
  speaker: string;
  review: boolean;
  approvals: string[];
  denials: string[];
  archived: boolean;
}

export interface PronunciationSchema extends PronunciationData {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AudioPronunciationData {
  id: string;
  objectId: string;
  size: number;
  prevSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioPronunciation extends Document<AudioPronunciationData, any, any> {}
