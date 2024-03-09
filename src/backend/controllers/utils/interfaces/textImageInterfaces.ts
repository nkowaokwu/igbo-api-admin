import { Document } from 'mongoose';

export interface TextImageData {
  media: string;
  size: number;
  prevSize?: number;
  igbo: string;
  english: string;
}

export interface TextImage extends Document<TextImageData, any, any> {}
