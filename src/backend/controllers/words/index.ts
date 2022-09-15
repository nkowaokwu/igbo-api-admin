import mongoose, { Document, LeanDocument } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import {
  assign,
  map,
  filter,
  uniqBy,
  omit,
} from 'lodash';
import removePrefix from 'src/backend/shared/utils/removePrefix';
import Word from 'src/backend/models/Word';
import ExampleSuggestion from 'src/backend/models/ExampleSuggestion';
import { findSearchWord } from 'src/backend/services/words';
import SuggestionTypes from 'src/backend/shared/constants/SuggestionTypes';
import { NO_PROVIDED_TERM } from 'src/backend/shared/constants/errorMessages';
import WordClass from 'src/backend/shared/constants/WordClass';
import { getDocumentsIds } from 'src/backend/shared/utils/documentUtils';
import createRegExp from 'src/backend/shared/utils/createRegExp';
import WordSuggestion from 'src/backend/models/WordSuggestion';
import { DICTIONARY_APP_URL } from 'src/config';
import {
  sortDocsBy,
  packageResponse,
  handleQueries,
  updateDocumentMerge,
} from '../utils';
import {
  searchIgboTextSearch,
  strictSearchIgboQuery,
  searchEnglishRegexQuery,
  searchForAllWordsWithAudioPronunciations,
  searchForAllWordsWithIsStandardIgbo,
  searchForAssociatedSuggestions,
} from '../utils/queries';
import { findWordsWithMatch } from '../utils/buildDocs';
import { createExample, executeMergeExample, findExampleByAssociatedWordId } from '../examples';
import { deleteWordSuggestionsByOriginalWordId } from '../wordSuggestions';
import { sendMergedEmail } from '../email';
import { renameAudioPronunciation } from '../utils/AWS-API';
import * as Interfaces from '../utils/interfaces';
import { handleSyncingSynonyms, handleSyncingAntonyms } from './helpers';

/* Gets words from JSON dictionary */
export const getWordData = (req: Request, res: Response, next: NextFunction): Response | void => {
  try {
    const { keyword } = req.query;
    const searchWord = removePrefix(keyword);
    if (!searchWord) {
      throw new Error(NO_PROVIDED_TERM);
    }
    const regexWord = createRegExp(searchWord);
    return res.send(findSearchWord(regexWord, searchWord));
  } catch (err) {
    return next(err);
  }
};

/* Searches for a word with Igbo stored in MongoDB */
export const searchWordUsingIgbo = async (
  {
    query, searchWord, constructedTerms, ...rest
  }:
  { query: any, searchWord: string, constructedTerms: boolean },
): Promise<Interfaces.Word[]> => {
  const words: Interfaces.Word[] = await findWordsWithMatch({ match: query, constructedTerms, ...rest });
  return sortDocsBy(searchWord, words, 'word');
};

/* Searches for word with English stored in MongoDB */
export const searchWordUsingEnglish = async (
  {
    query, searchWord, constructedTerms, ...rest
  }:
  { query: any, searchWord: string, constructedTerms: boolean },
): Promise<Interfaces.Word[]> => {
  const words: Interfaces.Word[] = await findWordsWithMatch({ match: query, constructedTerms, ...rest });
  return sortDocsBy(searchWord, words, 'definitions[0]');
};

/* Gets words from MongoDB */
export const getWords = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const {
      searchWord,
      regexKeyword,
      range,
      skip,
      limit,
      strict,
      dialects,
      filters,
      user,
      constructedTerms,
      ...rest
    } = handleQueries(req);
    const searchQueries = {
      searchWord,
      skip,
      limit,
      dialects,
      examples: true,
      constructedTerms,
    };
    let query: {
      word?: any,
      text?: any
      definitions?: any
    } = !strict
      ? searchIgboTextSearch(searchWord, regexKeyword, filters)
      : strictSearchIgboQuery(searchWord);
    const words = await searchWordUsingIgbo({ query, ...searchQueries });
    if (!words.length) {
      query = searchEnglishRegexQuery(regexKeyword, filters);
      const englishWords = await searchWordUsingEnglish({ query, ...searchQueries });
      return await packageResponse({
        res,
        docs: englishWords,
        model: Word,
        query,
        ...rest,
      });
    }
    return await packageResponse({
      res,
      docs: words,
      model: Word,
      query,
      ...rest,
    });
  } catch (err) {
    return next(err);
  }
};

// Get only constructedTerms from the dictionary
export const getConstructedTerms = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    req.query.constructedTerms = true;
    return await getWords(req, res, next);
  } catch (err) {
    return next(err);
  }
};

/* Returns a word from MongoDB using an id */
export const getWord = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const updatedWord = await findWordsWithMatch({
      match: { _id: mongoose.Types.ObjectId(id) },
      examples: true,
      limit: 1,
    })
      .then(async ([word]: Interfaces.Word[]) => {
        if (!word) {
          throw new Error('No word exists with the provided id.');
        }
        return word;
      });
    return res.send(updatedWord);
  } catch (err) {
    return next(err);
  }
};

/* Creates Word documents in MongoDB database */
export const createWord = async (
  data: (
    Interfaces.WordClientData
    | Interfaces.WordSuggestion
    | LeanDocument<Document<Interfaces.WordClientData | Interfaces.WordSuggestion>>
  ),
): Promise<Document<Interfaces.Word>> => {
  const {
    examples,
    word,
    wordClass,
    definitions,
    variations,
    stems,
    dialects,
    isStandardIgbo,
    ...rest
  } = data;

  const wordData = {
    word,
    wordClass,
    definitions,
    variations,
    stems,
    attributes: {
      isStandardIgbo,
    },
    dialects: {},
    ...rest,
  };

  const newWord: Document<Interfaces.Word> | any = new Word(wordData);
  await newWord.save();

  /* Go through each word's example and create an Example document */
  const savedExamples = map(examples, async (example) => {
    const exampleData = {
      ...example,
      associatedWords: [newWord.id],
    };
    return createExample(exampleData);
  });

  /* Wait for all the Examples to be created and then add them to the Word document */
  const resolvedExamples = await Promise.all(savedExamples);
  const exampleIds = getDocumentsIds(resolvedExamples);
  newWord.examples = exampleIds;
  return newWord.save();
};

const updateSuggestionAfterMerge = async (
  suggestionDoc: Document<Interfaces.WordSuggestion>,
  originalWordDocId: string,
  mergedBy: string,
): Promise<Document<Interfaces.WordSuggestion>> => {
  const updatedSuggestionDoc: Document<Interfaces.WordSuggestion> | any = (
    await updateDocumentMerge(suggestionDoc, originalWordDocId, mergedBy)
  );
  const exampleSuggestions: Document<Interfaces.ExampleSuggestion>[] = (
    await ExampleSuggestion.find({ associatedWords: suggestionDoc.id })
  );
  await Promise.all(map(exampleSuggestions, async (exampleSuggestion: Interfaces.ExampleSuggestion) => {
    const removeSuggestionAssociatedIds: Interfaces.ExampleSuggestion = assign(exampleSuggestion);
    /* Before creating new Example from ExampleSuggestion,
     * all associated word suggestion ids must be removed
     */
    removeSuggestionAssociatedIds.associatedWords = filter(
      exampleSuggestion.associatedWords,
      (associatedWord) => associatedWord.toString() !== suggestionDoc.id.toString(),
    );
    if (!removeSuggestionAssociatedIds.associatedWords.includes(originalWordDocId)) {
      removeSuggestionAssociatedIds.associatedWords.push(originalWordDocId);
    }
    const updatedExampleSuggestion = await removeSuggestionAssociatedIds.save();
    return executeMergeExample(updatedExampleSuggestion.id, mergedBy);
  }));
  return updatedSuggestionDoc.save();
};

/* Takes the suggestion word pronunciation and overwrites the existing Word document's pronunciation file */
const overwriteWordPronunciation = async (
  suggestion: Document<Interfaces.WordSuggestion> | Interfaces.WordSuggestion,
  word: Document<Interfaces.Word> | Interfaces.Word,
): Promise<Document<Interfaces.Word>> => {
  try {
    /**
     * Creating AWS URI for word pronunciation
     * If the suggestion doesn't have a pronunciation, then an empty string
     * will be passed in to tell AWS to delete the audio record for the associated
     * Word document
     */
    const suggestionDocId = suggestion.pronunciation ? suggestion.id : '';
    const isMp3 = suggestion.pronunciation.includes('mp3');
    const finalPronunciationUri = await renameAudioPronunciation(suggestionDocId, word.id, isMp3);

    suggestion.pronunciation = finalPronunciationUri;
    word.pronunciation = finalPronunciationUri;

    await Promise.all(Object.entries(suggestion.dialects).map(async ([
      dialectalWord,
      { pronunciation: suggestionPronunciation },
    ]) => {
      const wordDialectPronunciationKey = `${word.id}-${dialectalWord}`;
      const suggestionDialectPronunciationKey = `${suggestion.id}-${dialectalWord}`;
      /**
       * If the Word dialect's pronunciation doesn't include the Word's id,
       * the dialect's pronunciation uri key will get updated
       */
      const suggestionDialectDocId = suggestionPronunciation ? suggestionDialectPronunciationKey : '';
      const isMp3 = suggestionPronunciation.includes('mp3');
      const finalDialectPronunciationUri = (
        await renameAudioPronunciation(suggestionDialectDocId, wordDialectPronunciationKey, isMp3)
      );

      suggestion.dialects[dialectalWord].pronunciation = finalDialectPronunciationUri;
      word.dialects[dialectalWord].pronunciation = finalDialectPronunciationUri;
    }));

    // Since the word suggestion is no longer needed, we don't need to trigger any AWS-API.ts functions
    suggestion.skipPronunciationHook = true;
    await suggestion.save();
    await WordSuggestion.findOneAndUpdate({ _id: suggestion.id }, suggestion.toObject());
    await Word.findOneAndUpdate({ _id: word.id }, word.toObject());
    return await word.save();
  } catch (err) {
    console.log('An error while merging audio pronunciations failed:', err.message);
    console.log(err.stack);
    return err.stack;
  }
};

/* Merges new data into an existing Word document */
const mergeIntoWord = (
  suggestionDoc: Document<Interfaces.WordSuggestion>,
  mergedBy: string,
): Promise<Interfaces.Word | void> => {
  const suggestionDocObject: Interfaces.WordSuggestion | any = suggestionDoc.toObject();
  return Word.findOneAndUpdate(
    { _id: suggestionDocObject.originalWordId },
    { $set: omit(suggestionDocObject, ['pronunciation']) },
    { new: true },
  )
    .then(async (updatedWord: Document<Interfaces.Word>) => {
      if (!updatedWord) {
        throw new Error('Word doesn\'t exist');
      }

      await overwriteWordPronunciation(suggestionDoc, updatedWord);
      await updateSuggestionAfterMerge(suggestionDoc, updatedWord.id, mergedBy);
      return (await findWordsWithMatch({ match: { _id: suggestionDocObject.originalWordId }, limit: 1 }))[0];
    })
    .catch((error) => {
      throw new Error(error.message);
    });
};

/* Creates a new Word document from an existing WordSuggestion or GenericWord document */
const createWordFromSuggestion = (
  suggestionDoc: Document<Interfaces.WordSuggestion>,
  mergedBy: string,
): Promise<Document<Interfaces.Word> | void> => (
  createWord(suggestionDoc.toObject())
    .then(async (word: Document<Interfaces.Word>) => {
      const updatedPronunciationsWord = await overwriteWordPronunciation(suggestionDoc, word);
      await updateSuggestionAfterMerge(suggestionDoc, word.id, mergedBy);
      return updatedPronunciationsWord;
    })
    .catch(() => {
      throw new Error('An error occurred while saving the new word.');
    })
);

/* Sends confirmation merged email to user if they provided an email */
const handleSendingMergedEmail = async (result: Interfaces.Word): Promise<void> => {
  try {
    if (result.authorEmail) {
      sendMergedEmail({
        to: [result.authorEmail],
        suggestionType: SuggestionTypes.WORD,
        submissionLink: `${DICTIONARY_APP_URL}/word?word=${result.word}`,
        ...result,
      });
    }
  } catch (err) {
    console.log(err.message);
  };
};

/* Merges the existing WordSuggestion of GenericWord into either a brand
 * new Word document or merges into an existing Word document */
export const mergeWord = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { user, suggestionDoc } = req;
    const {
      originalWordId,
    }: Document<Interfaces.WordSuggestion> | any = await WordSuggestion.findById(suggestionDoc.id);

    const mergedWord: Document<Interfaces.Word> | any = (
      originalWordId
        ? await mergeIntoWord(suggestionDoc, user.uid)
        : await createWordFromSuggestion(suggestionDoc, user.uid)
    ) || {};
    await handleSyncingSynonyms(mergedWord);
    await handleSyncingAntonyms(mergedWord);
    await handleSendingMergedEmail({
      ...(mergedWord.toObject ? mergedWord.toObject() : mergedWord),
      wordClass: WordClass[suggestionDoc.wordClass]?.label || 'No word class',
      authorEmail: suggestionDoc.authorEmail,
      authorId: suggestionDoc.authorId,
      editorsNotes: suggestionDoc.editorsNotes,
    });
    return res.send(mergedWord);
  } catch (err) {
    return next(err);
  }
};

const findAndUpdateWord = (id: string, cb: (any) => Interfaces.Word): Promise<Interfaces.Word> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(!id ? 'No word id provided' : 'Invalid word id provided');
  }

  return Word.findById(id)
    .then(async (word: Interfaces.Word) => {
      if (!word) {
        throw new Error('Word doesn\'t exist');
      }
      return cb(assign(word));
    });
};

/* Updates a Word document in the database */
export const putWord = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { body: data, params: { id } } = req;
    if (!data.word) {
      throw new Error('Required information is missing, double your provided data.');
    }

    const savedWord: Interfaces.Word = await findAndUpdateWord(id, (word) => {
      const updatedWord = assign(word, data);
      return updatedWord.save();
    });
    return res.send(savedWord);
  } catch (err) {
    return next(err);
  }
};

/* Replaces all instances of oldId inside all of the examples with
 * with the newId */
const replaceWordIdsFromExampleAssociatedWords = (examples: Interfaces.Example[], oldId: string, newId: string) => (
  Promise.all(map(examples, (example) => {
    const cleanedWordExample = assign(example);
    cleanedWordExample.associatedWords.push(newId);
    cleanedWordExample.associatedWords = uniqBy(
      filter(cleanedWordExample.associatedWords, (associatedWord) => associatedWord.toString() !== oldId.toString()),
      (associatedWord) => associatedWord.toString(),
    );
    return cleanedWordExample.save();
  }))
);

/* Deletes the specified Word document while moving its contents
 * to another Word document, which preserves the original Word
 * document's data */
export const deleteWord = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { body: data, params: { id: toBeDeletedWordId } } = req;
    const { primaryWordId }: { primaryWordId: string } = data;

    const {
      pronunciation,
      definitions = [],
      variations = [],
      stems = [],
      relatedTerms = [],
      hypernyms = [],
      hyponyms = [],
      nsibidi,
    }: Document<Interfaces.Word> | any = await Word.findById(toBeDeletedWordId);
    const toBeDeletedWordExamples: Interfaces.Example[] | any = await findExampleByAssociatedWordId(toBeDeletedWordId);
    const savedCombinedWord = await findAndUpdateWord(primaryWordId, async (combineWord: Interfaces.Word) => {
      const updatedWord = assign(combineWord);
      updatedWord.pronunciation = updatedWord.pronunciation || pronunciation;
      updatedWord.definitions = Array.from(new Set([...updatedWord.definitions, ...definitions]));
      updatedWord.variations = Array.from(new Set([...updatedWord.variations, ...variations]));
      updatedWord.stems = Array.from(new Set([...updatedWord.stems, ...stems]));
      updatedWord.relatedTerms = Array.from(new Set([...updatedWord.relatedTerms, ...relatedTerms]));
      updatedWord.hypernyms = Array.from(new Set([...updatedWord.hypernyms, ...hypernyms]));
      updatedWord.hyponyms = Array.from(new Set([...updatedWord.hyponyms, ...hyponyms]));
      updatedWord.nsibidi = updatedWord.nsibidi || nsibidi;

      /* Deletes the specified word and connected wordSuggestions regardless of their merged status */
      await Word.deleteOne({ _id: toBeDeletedWordId });
      await deleteWordSuggestionsByOriginalWordId(toBeDeletedWordId);
      await replaceWordIdsFromExampleAssociatedWords(toBeDeletedWordExamples, toBeDeletedWordId, primaryWordId);
      // Returns the result
      return updatedWord.save();
    });
    return res.send(savedCombinedWord);
  } catch (err) {
    return next(err);
  }
};

/* Grabs all Word Suggestions that are associated with a Word document */
export const getAssociatedWordSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const wordSuggestions = await WordSuggestion.find(searchForAssociatedSuggestions(id));
    return res.send(wordSuggestions);
  } catch (err) {
    return next(err);
  }
};

/* Returns all the WordSuggestions with audio pronunciations */
export const getTotalWordsWithAudioPronunciations = (): Promise<any> => (
  Word
    .find(searchForAllWordsWithAudioPronunciations())
    .lean()
    .exec()
);

/* Returns all the WordSuggestions that's in Standard Igbo */
export const getTotalWordsInStandardIgbo = (): Promise<any> => (
  Word
    .find(searchForAllWordsWithIsStandardIgbo())
    .lean()
    .exec()
);
