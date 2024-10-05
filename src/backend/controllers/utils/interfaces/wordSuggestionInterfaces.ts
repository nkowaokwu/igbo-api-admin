import { Document } from 'mongoose';
import { ExampleSuggestionData } from 'src/backend/controllers/utils/interfaces/exampleSuggestionInterfaces';
import { SuggestionData } from './suggestionInterfaces';
import { WordData } from './wordInterfaces';

export interface WordSuggestionData extends WordData, SuggestionData {
  originalWordId?: string;
  examples?: ExampleSuggestionData[];
}

export interface WordSuggestion extends Document, WordSuggestionData {}
