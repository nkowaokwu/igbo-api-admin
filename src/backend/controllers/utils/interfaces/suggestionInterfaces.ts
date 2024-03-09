import { Document, Types } from 'mongoose';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';

export interface SuggestionData {
  userComments?: string;
  authorEmail?: string;
  authorId?: string;
  approvals?: string[];
  denials?: string[];
  merged?: Types.ObjectId;
  mergedBy?: string;
  userInteractions?: string[];
  twitterPollUrl?: string;
  crowdsourcing: {
    [key in CrowdsourcingType]: boolean;
  };
}

export interface Suggestion extends Document<SuggestionData, any, any> {}
