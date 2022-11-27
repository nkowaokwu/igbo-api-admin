/* eslint-disable max-len */
import Dexie from 'dexie';

type IgboAPIEditorPlatformDexie = Dexie & {
  words: any,
  examples: any,
  wordSuggestions: any,
  exampleSuggestions: any,
  corpora: any,
  corpusSuggestions: any,
};

const igboAPIEditorPlatformDB = new Dexie('IgboAPIEditorPlatform') as IgboAPIEditorPlatformDexie;

const wordKeys = 'id, word, wordPronunciation, conceptualWord, definitions, dialects, tags, tenses, pronunciation, attributes, variations, stems, relatedTerms, hypernyms, hyponyms, nsibidi';
const wordSuggestionKeys = wordKeys.concat(', originalWordId, editorsNotes, userComments, authorEmail, authorId, merged, mergedBy, userInteractions, twitterPollId');
const exampleKeys = 'id, igbo, english, meaning, style, associatedWords, associatedDefinitionsSchemas, pronunciation, exampleForSuggestion';
const exampleSuggestionKeys = exampleKeys.concat(', originalExampleId, exampleForSuggestion, editorsNotes, userComments, authorEmail, authorId, source, merged, mergedBy, userInteractions');
const corpusKeys = 'id, title, body, media, duration, tags';
const corpusSuggestionKeys = corpusKeys.concat(', editorsNotes, authorEmail, authorId, approvals, denials, merged, mergedBy, userInteractions');

igboAPIEditorPlatformDB.version(1).stores({
  words: wordKeys,
  examples: exampleKeys,
  wordSuggestions: wordSuggestionKeys,
  exampleSuggestions: exampleSuggestionKeys,
  corpora: corpusKeys,
  corpusSuggestions: corpusSuggestionKeys,
});

export default igboAPIEditorPlatformDB;
