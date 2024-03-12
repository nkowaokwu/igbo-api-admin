import { Document } from 'mongoose';
import WordTagEnum from 'src/backend/shared/constants/WordTagEnum';

export interface CorpusClientData extends Corpus {
  id: string;
  authorId?: string;
  title: string;
  body: string;
  media: string;
  tags: WordTagEnum[];
}

export interface Corpus extends Document<Corpus, any, any> {}
