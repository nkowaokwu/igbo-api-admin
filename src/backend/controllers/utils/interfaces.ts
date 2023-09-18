import { Document, LeanDocument, Connection, Types } from 'mongoose';
import { Request } from 'express';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import Collections from 'src/shared/constants/Collection';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import { User } from 'firebase/auth';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import StatTypes from 'src/backend/shared/constants/StatTypes';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';

export interface HandleQueries {
  searchWord: string;
  regexKeyword: SearchRegExp;
  page: number;
  sort: { key: string; direction: string };
  skip: number;
  limit: number;
  filters: { [key: string]: string };
  user: EditorRequest['user'];
  strict: boolean;
  body: EditorRequest['body'];
  mongooseConnection: EditorRequest['mongooseConnection'];
  leaderboard?: LeaderboardType;
  timeRange?: LeaderboardTimeRange;
  uidQuery?: string;
  error?: any;
  response?: any;
  params: Request['params'];
}

export interface FirebaseUser extends User {
  editingGroup?: number | undefined;
  customClaims?: any;
  metadata?: any;
}
// @ts-expect-error EditorRequest
export interface EditorRequest extends Request {
  user: FirebaseUser;
  query: {
    keyword?: string;
    page?: number | string;
    range?: string;
    sort?: string;
    filter?: string;
    strict?: string;
    uid?: string;
    leaderboard?: LeaderboardType;
    timeRange?: LeaderboardTimeRange;
  };
  suggestionDoc?: Suggestion;
  body: any;
  word?: Word;
  response?: any;
  error?: Error;
  mongooseConnection: Connection;
}

export interface WordClientData extends Word {
  authorId?: string;
  examples?: ExampleClientData[];
}

export interface CorpusClientData extends Corpus {
  authorId?: string;
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
  tags: string[];
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

export interface Notification {
  initiator: {
    email: string;
    displayName: string;
    photoURL: string;
    uid: string;
  };
  title: string;
  message: string;
  data: any;
  type: string;
  recipient: string;
  opened: boolean;
  link: string;
  created_at?: number;
}

interface Suggestion extends Document<any>, LeanDocument<any> {
  id: Types.ObjectId;
  originalWordId?: Types.ObjectId;
  userComments?: string;
  authorEmail?: string;
  authorId?: string;
  approvals?: string[];
  denials?: string[];
  merged?: Types.ObjectId;
  mergedBy?: string;
  userInteractions?: string[];
}

export interface Corpus extends Document<any>, LeanDocument<any> {
  id: Types.ObjectId;
  title: string;
  body: string;
  media: string;
  tags: string[];
}

export interface CorpusSuggestion extends Corpus, Suggestion {}

export interface WordSuggestion extends Word, Suggestion {
  originalWordId?: Types.ObjectId;
  examples?: ExampleSuggestion[];
  twitterPollUrl?: string;
  crowdsourcing: {
    [key in CrowdsourcingType]: boolean;
  };
}

export interface TextImage {
  media: string;
  size: number;
  prevSize?: number;
  igbo: string;
  english: string;
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
  nsibidiCharacters: string[];
  associatedWords: string[];
  associatedDefinitionsSchemas: string[];
  pronunciations: {
    audio: string;
    speaker: string;
    review: boolean;
    approvals: string[];
    denials: string[];
    archived: boolean;
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  }[];
  updatedAt: Date;
}

export interface AudioPronunciation extends AudioPronunciationData, Document<any>, LeanDocument<any> {
  id: Types.ObjectId;
}

export interface AudioPronunciationData {
  id: Types.ObjectId | string;
  objectId: string;
  size: number;
  prevSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Stat extends StatData, Document<any>, LeanDocument<any> {
  id: Types.ObjectId;
}

export interface StatData {
  id: Types.ObjectId | string;
  type: StatTypes;
  authorId: string;
  value: number;
}

export interface ExampleSuggestion extends ExampleSuggestionData, Suggestion {
  id: Types.ObjectId;
  exampleForSuggestion: boolean;
  crowdsourcing: {
    [key in CrowdsourcingType]: boolean;
  };
}

export interface ExampleSuggestionData extends ExampleData {
  id: Types.ObjectId | string;
  exampleForSuggestion: boolean;
  crowdsourcing: {
    [key in CrowdsourcingType]: boolean;
  };
}

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

export interface NsibidiCharacter {
  id: Types.ObjectId | string;
  nsibidi: string;
  definitions: { text: string }[];
  pronunciation: string;
  wordClass: string;
}

export interface CachedDocument extends WordSuggestion, ExampleSuggestion {
  cachedAt: Date;
}

export interface UserRanking {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  count: number;
  position: number;
}

export interface Leaderboard extends Document<any>, LeanDocument<any> {
  id: Types.ObjectId;
  rankings: UserRanking[];
  type: LeaderboardType;
  page: number;
  updatedAt: Date;
}

export interface MergedOrRejectedEmailData {
  to: [string];
  suggestionType: string;
  submissionLink?: string;
  [key: string]: any;
}

export interface SuggestionsReminderData {
  to: [string];
  totalSuggestionsCount: number;
  wordSuggestionsCount: number;
  exampleSuggestionsCount: number;
}

export interface NewUserData {
  newUserEmail: string;
}

export interface UpdatedRoleNotificationData {
  to: [string];
  displayName: string;
  role: UserRoles;
}

export interface DocumentDeletionRequestNotification {
  translator: string;
  translatorEmail: string;
  note: string;
  resource: string;
  id: string;
  word: string;
  definition: string;
}

export interface DocumentUpdateNotification {
  author: string;
  to: string;
  translator: string;
  translatorEmail: string;
  type: string;
  resource: Collections;
  id: string;
  word: string;
}

export interface EmailMessage {
  from?: {
    email: string;
    name: string;
  };
  to: string[];
  templateId: string;
  dynamic_template_data: any;
}

export interface ConstructedMessage extends EmailMessage {
  reply_to: {
    email: string;
    name: string;
  };
  personalizations: {
    to: [
      {
        email: string;
      },
    ];
  }[];
}

export interface FormattedUser {
  uid: string;
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: string;
  editingGroup: string;
  lastSignInTime: string;
  creationTime: string;
}

export interface SearchRegExp {
  wordReg: RegExp;
  definitionsReg: RegExp;
}
