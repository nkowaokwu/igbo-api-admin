import { Types } from 'mongoose';
import { ExampleData } from 'src/backend/controllers/utils/interfaces/exampleInterfaces';
import { Suggestion } from 'src/backend/controllers/utils/interfaces/suggestionInterfaces';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';

export interface ExampleSuggestionData extends ExampleData {
  id: Types.ObjectId | string;
  exampleForSuggestion: boolean;
  source: SuggestionSourceEnum;
  crowdsourcing: {
    [key in CrowdsourcingType]: boolean;
  };
}

export interface ExampleSuggestion extends ExampleSuggestionData, Suggestion {
  id: Types.ObjectId;
  exampleForSuggestion: boolean;
  source: SuggestionSourceEnum;
  crowdsourcing: {
    [key in CrowdsourcingType]: boolean;
  };
}
