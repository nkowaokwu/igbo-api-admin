import { Document } from 'mongoose';
import { ExampleData } from 'src/backend/controllers/utils/interfaces/exampleInterfaces';
import { SuggestionData } from 'src/backend/controllers/utils/interfaces/suggestionInterfaces';

export interface ExampleSuggestionData extends ExampleData, SuggestionData {
  originalExampleId?: string;
  exampleForSuggestion: boolean;
}

export interface ExampleSuggestion extends Document, ExampleSuggestionData {}
