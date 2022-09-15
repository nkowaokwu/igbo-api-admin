import { Document, LeanDocument, Types } from 'mongoose';
import { Request } from 'express';
import { Role } from 'src/shared/constants/auth-types';
import Collections from 'src/shared/constants/Collections';

export interface EditorRequest extends Request {
  user: {
    uid: string,
  },
  query: {
    keyword?: string,
    page?: number | string,
    range?: string,
    sort?: string,
    filter?: string,
    strict?: string,
    constructedTerms?: boolean,
  },
  suggestionDoc?: any,
  body: any,
};

export interface WordClientData extends Word {
  authorId?: string,
  examples?: ExampleSuggestion[],
}

export interface WordDialect {
  dialects: string[],
  variations: string[],
  pronunciation: string,
}

export interface Word extends Document<any>, LeanDocument<any> {
  id: Types.ObjectId,
  word: string,
  wordClass: string | { label: string },
  definitions: [string],
  dialects: {
    [key: string]: WordDialect,
  },
  pronunciation: string,
  variations: string[],
  normalized: string,
  frequency: number,
  stems: string[],
  attributes: {
    isStandardIgbo: boolean,
    isAccented: boolean,
    isComplete: boolean,
  }
  nsibidi: string,
  relatedTerms: string[],
  hypernyms: string[],
  hyponyms: string[],
  updatedAt: Date,
  examples?: Example[],
};

export interface WordSuggestion extends Document<any>, LeanDocument<any> {
  id: Types.ObjectId,
  originalWordId?: Types.ObjectId,
  word: string,
  wordClass: string,
  definitions: [string],
  variations?: string[],
  userComments?: string,
  authorEmail?: string,
  authorId: string,
  pronunciation: string,
  attributes: {
    isStandardIgbo: boolean,
    isAccented: boolean,
    isComplete: boolean,
  }
  approvals?: string[],
  denials?: string[],
  updatedAt: Date,
  merged?: Types.ObjectId,
  mergedBy?: string,
  examples?: ExampleSuggestion[],
  dialects?: {
    [key: string]: WordDialect,
  },
  userInteractions?: string[],
};

export interface Example extends Document<any>, LeanDocument<any> {
  id: Types.ObjectId,
  igbo?: string,
  english?: string,
  associatedWords: string[],
  pronunciation: string,
  authorId: string,
  updatedAt: Date,
}

export interface ExampleSuggestion extends Document<any>, LeanDocument<any> {
  id: Types.ObjectId,
  originalExampleId?: Types.ObjectId,
  igbo?: string,
  english?: string,
  associatedWords: string[],
  exampleForSuggestion: boolean,
  editorsNotes: string,
  userComments: string,
  authorEmail: string,
  authorId: string,
  approvals: string[],
  denial: string[],
  updatedAt: Date,
  merged: Types.ObjectId,
  mergedBy: string,
  userInteractions?: string[],
};

export interface ExampleClientData {
  igbo?: string,
  english?: string,
  associatedWords: string[],
  exampleForSuggestion?: boolean,
  authorId?: string,
};

export interface MergedOrRejectedEmailData {
  to: [string],
  suggestionType: string,
  submissionLink: string,
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
