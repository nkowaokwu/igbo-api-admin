import { Document, Types } from 'mongoose';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import { PronunciationSchema } from 'src/backend/controllers/utils/interfaces/pronunciationInterfaces';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';

export interface ExampleClientData {
  source: Translation;
  translations: Translation[];
  meaning: string;
  nsibidi: string;
  nsibidiCharacters: string[];
  type: SentenceTypeEnum;
  style: ExampleStyleEnum;
  origin: SuggestionSourceEnum;
  associatedWords: string[];
  associatedDefinitionsSchemas: string[];
  exampleForSuggestion: boolean;
  authorId: string;
  originalExampleId: string;
  crowdsourcing: {
    [key in CrowdsourcingType]: boolean;
  };
  userInteractions: string[];
  updatedAt: Date;
}

export interface Example extends Document, ExampleData {}

export interface Translation {
  _id: string;
  language: LanguageEnum;
  text: string;
  pronunciations: PronunciationSchema[];
  approvals: string[];
  denials: string[];
  authorId: string;
}

export interface OutgoingTranslation {
  language: LanguageEnum;
  text: string;
  pronunciations: PronunciationSchema[];
  approvals: string[];
  denials: string[];
  authorId: string;
}

export interface ExampleData {
  source: Translation;
  translations: Translation[];
  meaning: string;
  nsibidi: string;
  nsibidiCharacters: (Types.ObjectId | string)[];
  associatedWords: string[];
  associatedDefinitionsSchemas: string[];
  type: SentenceTypeEnum;
  style: ExampleStyleEnum;
  origin: SuggestionSourceEnum;
  updatedAt: Date;
}
