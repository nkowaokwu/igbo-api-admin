import { Document, Types } from 'mongoose';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import { PronunciationSchema } from 'src/backend/controllers/utils/interfaces/pronunciationInterfaces';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';

export interface ExampleClientData {
  id?: string;
  source?: Translation;
  translations?: Translation[];
  meaning?: string;
  nsibidi?: string;
  nsibidiCharacters?: string[];
  type?: SentenceTypeEnum;
  style?: ExampleStyleEnum;
  origin?: SuggestionSourceEnum;
  pronunciations?: { audio: string; speaker: string; createdAt?: string; updatedAt?: string }[];
  associatedWords: string[];
  associatedDefinitionsSchemas?: string[];
  exampleForSuggestion?: boolean;
  authorId?: string;
  originalExampleId?: string;
  crowdsourcing: {
    [key in CrowdsourcingType]?: boolean;
  };
  userInteractions?: string[];
}

export interface Example extends Document<ExampleData, any, any> {}

export interface Translation {
  language: LanguageEnum;
  text: string;
}
export interface ExampleData {
  id: Types.ObjectId | string;
  source?: Translation;
  translations?: Translation[];
  meaning?: string;
  nsibidi?: string;
  nsibidiCharacters: (Types.ObjectId | string)[];
  associatedWords: string[];
  associatedDefinitionsSchemas: string[];
  type: SentenceTypeEnum;
  style?: ExampleStyleEnum;
  origin?: SuggestionSourceEnum;
  pronunciations: PronunciationSchema[];
  updatedAt: Date;
}
