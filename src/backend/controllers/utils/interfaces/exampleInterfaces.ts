import { Document, LeanDocument, Types } from 'mongoose';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import { PronunciationSchema } from 'src/backend/controllers/utils/interfaces/pronunciationInterfaces';

export interface ExampleClientData {
  id?: string;
  igbo?: string;
  english?: string;
  meaning?: string;
  nsibidi?: string;
  nsibidiCharacters?: string[];
  type?: SentenceTypeEnum;
  style?: ExampleStyleEnum;
  source?: SuggestionSourceEnum;
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

export interface Example extends ExampleData, Document<any>, LeanDocument<any> {
  id: Types.ObjectId;
}

export interface ExampleData {
  id: Types.ObjectId | string;
  igbo?: string;
  english?: string;
  meaning?: string;
  nsibidi?: string;
  nsibidiCharacters: (Types.ObjectId | string)[];
  associatedWords: string[];
  associatedDefinitionsSchemas: string[];
  type: SentenceTypeEnum;
  source?: SuggestionSourceEnum;
  pronunciations: PronunciationSchema[];
  updatedAt: Date;
}
