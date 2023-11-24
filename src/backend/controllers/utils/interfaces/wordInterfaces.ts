import { Document, LeanDocument, Types } from 'mongoose';
import { Example, ExampleClientData } from 'src/backend/controllers/utils/interfaces/exampleInterfaces';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces/exampleSuggestionInterfaces';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
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

export interface Word extends WordData, Document<any>, LeanDocument<any> {
  id: Types.ObjectId;
}

export interface WordData {
  id: Types.ObjectId | string;
  word: string;
  wordPronunciation: string;
  conceptualWord: string;
  definitions: [DefinitionSchema];
  dialects: WordDialect[];
  pronunciation: string;
  variations: string[];
  normalized: string;
  frequency: number;
  stems: string[];
  tags: WordTagEnum[];
  attributes: {
    [WordAttributeEnum.IS_STANDARD_IGBO]: boolean;
    [WordAttributeEnum.IS_ACCENTED]: boolean;
    [WordAttributeEnum.IS_COMPLETE]: boolean;
    [WordAttributeEnum.IS_SLANG]: boolean;
    [WordAttributeEnum.IS_CONSTRUCTED_TERM]: boolean;
    [WordAttributeEnum.IS_BORROWED_TERM]: boolean;
    [WordAttributeEnum.IS_STEM]: boolean;
  };
  relatedTerms: string[];
  hypernyms: string[];
  hyponyms: string[];
  updatedAt: Date;
  examples?: (Example | ExampleSuggestion | ExampleClientData)[];
}
