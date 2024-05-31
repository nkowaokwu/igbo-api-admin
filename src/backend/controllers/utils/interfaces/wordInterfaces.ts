import { Document, Types } from 'mongoose';
import { ExampleData, ExampleClientData } from 'src/backend/controllers/utils/interfaces/exampleInterfaces';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import TenseEnum from 'src/backend/shared/constants/TenseEnum';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import WordTagEnum from 'src/backend/shared/constants/WordTagEnum';

export interface DefinitionSchema {
  wordClass: WordClassEnum | WordDialect;
  definitions: string[];
  label?: string;
  igboDefinitions: { igbo: string; nsibidi: string }[];
  nsibidi: string;
  nsibidiCharacters: (Types.ObjectId | string)[];
  _id?: Types.ObjectId;
  id?: string;
}

export interface WordDialect {
  dialects: DialectEnum[];
  variations: string[];
  pronunciation: string;
  word: string;
  _id?: Types.ObjectId;
  id?: string;
  editor?: string;
}

export interface WordClientData extends Word {
  authorId?: string;
  examples?: ExampleClientData[];
}

export interface Word extends Document<WordData, any, any> {}

export interface WordData {
  id: string;
  word: string;
  wordPronunciation: string;
  conceptualWord: string;
  definitions: DefinitionSchema[];
  dialects: WordDialect[];
  pronunciation: string;
  variations: string[];
  normalized: string;
  frequency: number;
  stems: string[];
  tags: WordTagEnum[];
  attributes: { [key in WordAttributeEnum]: boolean };
  tenses: { [key in TenseEnum]: string };
  relatedTerms: string[];
  hypernyms: string[];
  hyponyms: string[];
  updatedAt: Date;
  examples?: ExampleData[];
}
