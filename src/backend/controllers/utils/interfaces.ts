import {
  Document,
  LeanDocument,
  Connection,
  Types,
} from 'mongoose';
import { Request } from 'express';
import { Role } from 'src/shared/constants/auth-types';
import Collections from 'src/shared/constants/Collections';

export interface HandleQueries {
  searchWord: string,
  regexKeyword: SearchRegExp,
  page: number,
  sort: { key: string; direction: string; },
  skip: number,
  limit: number,
  filters: { [key: string]: string },
  user: EditorRequest['user'],
  strict: boolean,
  body: EditorRequest['body'],
  mongooseConnection: EditorRequest['mongooseConnection'],
};

// @ts-expect-error EditorRequest
export interface EditorRequest extends Request {
  user: {
    uid?: string,
  },
  query: {
    keyword?: string,
    page?: number | string,
    range?: string,
    sort?: string,
    filter?: string,
    strict?: string,
  },
  suggestionDoc?: Suggestion,
  body: any,
  word?: Word,
  mongooseConnection: Connection,
};

export interface WordClientData extends Word {
  authorId?: string,
  examples?: ExampleSuggestion[],
}

export interface CorpusClientData extends Corpus {
  authorId?: string,
};

export interface WordDialect {
  dialects: string[],
  variations: string[],
  pronunciation: string,
  word: string,
  _id?: Types.ObjectId,
  id?: string,
  editor?: string,
}

export interface DefinitionSchema {
  wordClass: string | WordDialect,
  definitions: string[],
  igboDefinitions: string[],
  nsibidi: string,
  _id?: Types.ObjectId,
  id?: string,
}

export interface Word extends Document<any>, LeanDocument<any> {
  id: Types.ObjectId,
  word: string,
  wordPronunciation: string,
  conceptualWord: string,
  definitions: [DefinitionSchema],
  dialects: WordDialect[],
  pronunciation: string,
  variations: string[],
  normalized: string,
  frequency: number,
  stems: string[],
  attributes: {
    isStandardIgbo: boolean,
    isAccented: boolean,
    isComplete: boolean,
    isSlang: boolean,
    isConstructedTerm: boolean,
    isBorrowedTerm: boolean,
    isStem: boolean,
  }
  relatedTerms: string[],
  hypernyms: string[],
  hyponyms: string[],
  updatedAt: Date,
  examples?: (Example | ExampleSuggestion)[],
};

export interface Notification {
  initiator: {
    email: string,
    displayName: string,
    photoURL: string,
    uid: string,
  },
  title: string,
  message: string,
  data: any,
  type: string,
  recipient: string,
  opened: boolean,
  link: string,
  created_at?: number,
}

interface Suggestion extends Document<any>, LeanDocument<any> {
  id: Types.ObjectId,
  originalWordId?: Types.ObjectId,
  userComments?: string,
  authorEmail?: string,
  authorId?: string,
  approvals?: string[],
  denials?: string[],
  merged?: Types.ObjectId,
  mergedBy?: string,
  userInteractions?: string[],
};

export interface Corpus extends Document<any>, LeanDocument<any> {
  id: Types.ObjectId,
  title: string,
  body: string,
  media: string,
  tags: string[],
};

export interface CorpusSuggestion extends Corpus, Suggestion {}

export interface WordSuggestion extends Word, Suggestion {
  originalWordId?: Types.ObjectId,
  examples?: ExampleSuggestion[],
  twitterPollUrl?: string,
};

export interface Example extends Document<any>, LeanDocument<any> {
  id: Types.ObjectId,
  igbo?: string,
  english?: string,
  meaning?: string,
  nsibidi?: string,
  associatedWords: string[],
  associatedDefinitionsSchemas: string[],
  pronunciation: string,
  updatedAt: Date,
}

export interface ExampleSuggestion extends Example, Suggestion {
  exampleForSuggestion: boolean,
};

export interface ExampleClientData {
  id?: string,
  igbo?: string,
  english?: string,
  meaning?: string,
  nsibidi?: string,
  pronunciation?: string,
  associatedWords: string[],
  associatedDefinitionsSchemas: string[],
  exampleForSuggestion?: boolean,
  authorId?: string,
  originalExampleId?: string,
};

export interface CachedDocument extends WordSuggestion, ExampleSuggestion {
  cachedAt: Date,
}

export interface MergedOrRejectedEmailData {
  to: [string],
  suggestionType: string,
  submissionLink?: string,
  [key: string]: any,
};

export interface SuggestionsReminderData {
  to: [string],
  totalSuggestionsCount: number,
  wordSuggestionsCount: number,
  exampleSuggestionsCount: number,
};

export interface NewUserData {
  newUserEmail: string,
};

export interface UpdatedRoleNotificationData {
  to: [string],
  displayName: string,
  role: Role,
};

export interface DocumentDeletionRequestNotification {
  translator: string,
  translatorEmail: string,
  note: string
  resource: string,
  id: string,
  word: string,
  definition: string,
};

export interface DocumentUpdateNotification {
  author: string,
  to: string,
  translator: string,
  translatorEmail: string,
  type: string,
  resource: Collections,
  id: string,
  word: string,
};

export interface EmailMessage {
  from?: {
    email: string,
    name: string,
  },
  to: string[],
  templateId: string,
  dynamic_template_data: any,
};

export interface ConstructedMessage extends EmailMessage {
  reply_to: {
    email: string,
    name: string,
  },
  personalizations: {
    to: [{
      email: string,
    }],
  }[],
}

export interface FormattedUser {
  uid: string,
  id: string,
  email: string,
  displayName: string,
  role: string,
  editingGroup: string,
  lastSignInTime: string,
  creationTime: string,
};

export interface SearchRegExp {
  wordReg: RegExp,
  definitionsReg: RegExp,
};
