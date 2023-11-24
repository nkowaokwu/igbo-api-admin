import { Corpus } from './corpusInterfaces';
import { Suggestion } from './suggestionInterfaces';

export interface CorpusSuggestion extends Corpus, Suggestion {}
