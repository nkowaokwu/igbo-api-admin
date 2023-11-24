import { Document, LeanDocument, Types } from 'mongoose';

export interface Suggestion extends Document<any>, LeanDocument<any> {
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
