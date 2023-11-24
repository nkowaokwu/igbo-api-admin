import { Document, LeanDocument, Types } from 'mongoose';

export interface TextImageData {
  media: string;
  size: number;
  prevSize?: number;
  igbo: string;
  english: string;
}

export interface TextImage extends TextImageData, Document<any>, LeanDocument<any> {
  id: Types.ObjectId;
}
