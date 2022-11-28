/* eslint-disable max-len */
import Dexie from 'dexie';
import Collection from 'src/shared/constants/Collections';

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
const wordSuggestionKeys = 'id, word, wordPronunciation, conceptualWord, definitions, dialects, tags, tenses, pronunciation, attributes, variations, stems, relatedTerms, hypernyms, hyponyms, nsibidi, originalWordId, editorsNotes, userComments, authorEmail, authorId, merged, mergedBy, userInteractions, twitterPollId';
const exampleKeys = 'id, igbo, english, meaning, style, associatedWords, associatedDefinitionsSchemas, pronunciation, exampleForSuggestion';
const exampleSuggestionKeys = 'id, igbo, english, meaning, style, associatedWords, associatedDefinitionsSchemas, pronunciation, exampleForSuggestion, originalExampleId, exampleForSuggestion, editorsNotes, userComments, authorEmail, authorId, source, merged, mergedBy, userInteractions';
const corpusKeys = 'id, title, body, media, duration, tags';
const corpusSuggestionKeys = 'id, title, body, media, duration, tags, editorsNotes, authorEmail, authorId, approvals, denials, merged, mergedBy, userInteractions';

igboAPIEditorPlatformDB.version(1).stores({
  [Collection.WORDS]: wordKeys,
  [Collection.EXAMPLES]: exampleKeys,
  [Collection.WORD_SUGGESTIONS]: wordSuggestionKeys,
  [Collection.EXAMPLE_SUGGESTIONS]: exampleSuggestionKeys,
  [Collection.CORPORA]: corpusKeys,
  [Collection.CORPUS_SUGGESTIONS]: corpusSuggestionKeys,
});

export default igboAPIEditorPlatformDB;
