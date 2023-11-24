import { Types } from 'mongoose';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces/exampleSuggestionInterfaces';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import { Suggestion } from './suggestionInterfaces';
import { Word } from './wordInterfaces';

export interface WordSuggestion extends Word, Suggestion {
  originalWordId?: Types.ObjectId;
  examples?: ExampleSuggestion[];
  twitterPollUrl?: string;
  crowdsourcing: {
    [key in CrowdsourcingType]: boolean;
  };
}
