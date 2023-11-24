import { Document, LeanDocument, Types } from 'mongoose';
import WordTagEnum from 'src/backend/shared/constants/WordTagEnum';

export interface Corpus extends Document<any>, LeanDocument<any> {
  id: Types.ObjectId;
  title: string;
  body: string;
  media: string;
  tags: WordTagEnum[];
}

export interface CorpusClientData extends Corpus {
  authorId?: string;
}
