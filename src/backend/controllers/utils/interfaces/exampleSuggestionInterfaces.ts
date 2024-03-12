import { Document } from 'mongoose';
import { ExampleData } from 'src/backend/controllers/utils/interfaces/exampleInterfaces';
import { SuggestionData } from 'src/backend/controllers/utils/interfaces/suggestionInterfaces';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';

export interface ExampleSuggestionData extends ExampleData, SuggestionData {
  originalExampleId?: string;
  exampleForSuggestion: boolean;
  source: SuggestionSourceEnum;
}

export interface ExampleSuggestion extends Document<ExampleSuggestionData, any, any> {}
