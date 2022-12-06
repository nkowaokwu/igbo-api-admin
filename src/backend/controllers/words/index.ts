import mongoose, { Document, LeanDocument } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import {
  assign,
  filter,
  map,
  omit,
  uniqBy,
} from 'lodash';
import removePrefix from 'src/backend/shared/utils/removePrefix';
import { wordSchema } from 'src/backend/models/Word';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { wordSuggestionSchema } from 'src/backend/models/WordSuggestion';
import { findSearchWord } from 'src/backend/services/words';
import SuggestionTypes from 'src/backend/shared/constants/SuggestionTypes';
import { NO_PROVIDED_TERM } from 'src/backend/shared/constants/errorMessages';
import WordClass from 'src/backend/shared/constants/WordClass';
import Requirements from 'src/backend/shared/constants/Requirements';
import { getDocumentsIds } from 'src/backend/shared/utils/documentUtils';
import createRegExp from 'src/backend/shared/utils/createRegExp';
import { DICTIONARY_APP_URL } from 'src/backend/config';
import {
  sortDocsBy,
  packageResponse,
  handleQueries,
  updateDocumentMerge,
} from '../utils';
import {
  searchIgboTextSearch,
  strictSearchIgboQuery,
  searchForAllWordsWithAudioPronunciations,
  searchForAllWordsWithIsStandardIgbo,
  searchForAssociatedSuggestions,
  searchForAssociatedSuggestionsByTwitterId,
} from '../utils/queries';
import { findWordsWithMatch } from '../utils/buildDocs';
import { createExample, executeMergeExample, findExampleByAssociatedWordId } from '../examples';
import { deleteWordSuggestionsByOriginalWordId } from '../wordSuggestions';
import { sendMergedEmail } from '../email';
import { renameAudioPronunciation } from '../utils/MediaAPIs/AudioAPI';
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
    query,
    searchWord,
    mongooseConnection,
    ...rest
  }:
  { query: any, searchWord: string, mongooseConnection: any },
): Promise<Interfaces.Word[]> => {
  const Word = mongooseConnection.model('Word', wordSchema);
  const words: Interfaces.Word[] = await findWordsWithMatch({ match: query, Word, ...rest });
  return sortDocsBy(searchWord, words, 'word');
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
      mongooseConnection,
      ...rest
    } = handleQueries(req);
    const searchQueries = {
      searchWord,
      skip,
      limit,
      dialects,
      examples: true,
    };
    const query: {
      word?: any,
      text?: any
      definitions?: any
    } = !strict
      ? searchIgboTextSearch(searchWord, regexKeyword, filters)
      : strictSearchIgboQuery(searchWord);
    const words = await searchWordUsingIgbo({ query, mongooseConnection, ...searchQueries });
    const Word = mongooseConnection.model('Word', wordSchema);
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

/* Returns a word from MongoDB using an id */
export const getWord = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const Word = mongooseConnection.model('Word', wordSchema);

    const updatedWord = await findWordsWithMatch({
      match: { _id: mongoose.Types.ObjectId(id) },
      examples: true,
      limit: 1,
      Word,
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
  mongooseConnection: any,
): Promise<Document<Interfaces.Word>> => {
  const {
    examples,
    word,
    wordClass,
    definitions,
    variations,
    stems,
    dialects = {},
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
    dialects,
    ...rest,
  };

  const Word = mongooseConnection.model('Word', wordSchema);
  const newWord: Document<Interfaces.Word> | any = new Word(wordData);
  await newWord.save();

  /* Go through each word's example and create an Example document */
  const savedExamples = map(examples, async (example) => {
    const exampleData = {
      ...example,
      associatedWords: [newWord.id],
    };
    return createExample(exampleData, mongooseConnection);
  });

  /* Wait for all the Examples to be created and then add them to the Word document */
  const resolvedExamples = await Promise.all(savedExamples);
  const exampleIds = getDocumentsIds(resolvedExamples);
  newWord.examples = exampleIds;
  return newWord.save();
};

const updateSuggestionAfterMerge = async (
  suggestionDoc: Interfaces.WordSuggestion,
  originalWordDoc: Interfaces.Word,
  mergedBy: string,
  mongooseConnection: any,
): Promise<Interfaces.WordSuggestion> => {
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
  const updatedSuggestionDoc: Interfaces.WordSuggestion | any = (
    await updateDocumentMerge(suggestionDoc, originalWordDoc.id.toString(), mergedBy)
  );
  const exampleSuggestions: Interfaces.ExampleSuggestion[] = (
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
    if (!removeSuggestionAssociatedIds.associatedWords.includes(originalWordDoc.id.toString())) {
      removeSuggestionAssociatedIds.associatedWords.push(originalWordDoc.id.toString());
    }
    /* Before creating new Example from ExampleSuggestion,
     * all associated definitions schema ids must be removed
     */
    // removeSuggestionAssociatedIds.associatedDefinitionsSchemas = filter(
    //   exampleSuggestion.associatedDefinitionsSchemas,
    //   (associatedDefinitionSchema) => (
    // !find(suggestionDoc.definitions, (({ _id: wordSuggestionDefinitionSchemaId }) => (
    //     wordSuggestionDefinitionSchemaId.toString() === associatedDefinitionSchema.toString())
    //   )),
    // );
    // const lookForDefinitionSchemaInOriginalDoc = (definitionSchemaId: string) => (
    //   // Look for a original document definitions schema that has the current associated definitions Schema
    //   find(originalWordDoc.definitions, (({ _id }) => _id.toString() === definitionSchemaId))
    // );
    // removeSuggestionAssociatedIds.associatedDefinitionsSchemas.forEach((associatedDefinitionsSchema) => {
    //   const originalDocDefinitionSchemaId = lookForDefinitionSchemaInOriginalDoc(associatedDefinitionsSchema);
    //   if (originalDocDefinitionSchemaId?._id) {
    //     removeSuggestionAssociatedIds.associatedDefinitionsSchemas
    //       .push(originalDocDefinitionSchemaId._id.toString());
    //   }
    // });
    const updatedExampleSuggestion = await removeSuggestionAssociatedIds.save();
    return executeMergeExample(updatedExampleSuggestion.id.toString(), mergedBy, mongooseConnection);
  }));
  return updatedSuggestionDoc.save();
};

/* Takes the suggestion word pronunciation and overwrites the existing Word document's pronunciation file */
const overwriteWordPronunciation = async (
  initialSuggestion: Interfaces.WordSuggestion,
  word: Interfaces.Word,
  mongooseConnection: any,
): Promise<Document<Interfaces.Word>> => {
  const Word = mongooseConnection.model('Word', wordSchema);
  const WordSuggestion = mongooseConnection.model('WordSuggestion', wordSuggestionSchema);
  try {
    /**
     * Creating AWS URI for word pronunciation
     * If the suggestion doesn't have a pronunciation, then an empty string
     * will be passed in to tell AWS to delete the audio record for the associated
     * Word document
     */
    const suggestionDocId = initialSuggestion.pronunciation ? initialSuggestion.id.toString() : '';
    const isMp3 = initialSuggestion.pronunciation.includes('mp3');
    const finalPronunciationUri = await renameAudioPronunciation(suggestionDocId, word.id, isMp3);

    initialSuggestion.pronunciation = finalPronunciationUri;
    word.pronunciation = finalPronunciationUri;

    // Since the word suggestion is no longer needed, we don't need to trigger any AudioAPI.ts functions
    initialSuggestion.skipPronunciationHook = true;
    const suggestion = await initialSuggestion.save();

    await Promise.all(suggestion.dialects || [].map(async ([
      rawDialectalWord,
      { pronunciation: suggestionPronunciation, _id: dialectalWordId },
    ]) => {
      const wordDialectPronunciationKey = `${word.id}-${dialectalWordId}`;
      const suggestionDialectPronunciationKey = `${suggestion.id}-${dialectalWordId}`;
      /**
       * If the Word dialect's pronunciation doesn't include the Word's id,
       * the dialect's pronunciation uri key will get updated
       */
      const suggestionDialectDocId = suggestionPronunciation ? suggestionDialectPronunciationKey : '';
      const isMp3 = suggestionPronunciation.includes('mp3');
      const finalDialectPronunciationUri = (
        await renameAudioPronunciation(suggestionDialectDocId, wordDialectPronunciationKey, isMp3)
      );

      suggestion.dialects[rawDialectalWord].pronunciation = finalDialectPronunciationUri;
      if (!word.dialects[rawDialectalWord]) {
        // @ts-expect-error _id
        word.dialects[rawDialectalWord] = {
          dialects: [],
          variations: [],
          pronunciation: '',
        };
      }
      word.dialects[rawDialectalWord].pronunciation = finalDialectPronunciationUri;
    }));

    await suggestion.save();
    await WordSuggestion.findOneAndUpdate({ _id: suggestion.id }, suggestion.toObject());
    await Word.findOneAndUpdate({ _id: word.id }, word.toObject());
    return await word.save();
  } catch (err) {
    console.log('An error occurred while merging audio pronunciations failed:', err.message);
    console.log('Deleting the associated word document to avoid producing duplicates');
    await word.delete();
    throw err;
  }
};

/* Merges new data into an existing Word document */
const mergeIntoWord = (
  suggestionDoc: Interfaces.WordSuggestion,
  mergedBy: string,
  mongooseConnection: any,
): Promise<Interfaces.Word | void> => {
  const suggestionDocObject: Interfaces.WordSuggestion | any = suggestionDoc.toObject();
  const Word = mongooseConnection.model('Word', wordSchema);
  return Word.findOneAndUpdate(
    { _id: suggestionDocObject.originalWordId },
    { $set: omit(suggestionDocObject, ['pronunciation']) },
    { new: true },
  )
    .then(async (updatedWord: Interfaces.Word) => {
      if (!updatedWord) {
        throw new Error('Word doesn\'t exist');
      }

      await overwriteWordPronunciation(suggestionDoc, updatedWord, mongooseConnection);
      await updateSuggestionAfterMerge(suggestionDoc, updatedWord, mergedBy, mongooseConnection);
      return (await findWordsWithMatch({ match: { _id: suggestionDocObject.originalWordId }, limit: 1, Word }))[0];
    })
    .catch((error) => {
      throw new Error(error.message);
    });
};

/* Creates a new Word document from an existing WordSuggestion or GenericWord document */
const createWordFromSuggestion = (
  suggestionDoc: Document<Interfaces.WordSuggestion>,
  mergedBy: string,
  mongooseConnection: any,
): Promise<Document<Interfaces.Word> | void> => (
  createWord(suggestionDoc.toObject(), mongooseConnection)
    .then(async (word: Document<Interfaces.Word>) => {
      const updatedPronunciationsWord = await overwriteWordPronunciation(suggestionDoc, word, mongooseConnection);
      await updateSuggestionAfterMerge(suggestionDoc, word, mergedBy, mongooseConnection);
      return updatedPronunciationsWord;
    })
    .catch((err) => {
      throw new Error(`An error occurred while saving the new word: ${err.message}`);
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
    const { user, suggestionDoc, mongooseConnection } = req;

    if (suggestionDoc.approvals.length < Requirements.MINIMUM_REQUIRED_APPROVALS) {
      throw new Error('Suggestion document doesn\'t have enough approvals to be merged.');
    }

    const mergedWord: Document<Interfaces.Word> | any = (
      suggestionDoc.originalWordId
        ? await mergeIntoWord(suggestionDoc, user.uid, mongooseConnection)
        : await createWordFromSuggestion(suggestionDoc, user.uid, mongooseConnection)
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

const findAndUpdateWord = (
  id: string,
  mongooseConnection: any,
  cb: (any) => Interfaces.Word,
): Promise<Interfaces.Word> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(!id ? 'No word id provided' : 'Invalid word id provided');
  }
  const Word = mongooseConnection.model('Word', wordSchema);

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
    const { body: data, params: { id }, mongooseConnection } = req;
    if (!data.word) {
      throw new Error('Required information is missing, double your provided data.');
    }

    const savedWord: Interfaces.Word = await findAndUpdateWord(id, mongooseConnection, (word) => {
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
    const { body: data, params: { id: toBeDeletedWordId }, mongooseConnection } = req;
    const { primaryWordId }: { primaryWordId: string } = data;
    const Word = mongooseConnection.model('Word', wordSchema);

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
    const toBeDeletedWordExamples: Interfaces.Example[] | any = (
      await findExampleByAssociatedWordId(toBeDeletedWordId, mongooseConnection)
    );
    const savedCombinedWord = await findAndUpdateWord(
      primaryWordId,
      mongooseConnection,
      async (combineWord: Interfaces.Word) => {
        const updatedWord = assign(combineWord);
        updatedWord.pronunciation = updatedWord.pronunciation || pronunciation;
        const updatedDefinitions = [...updatedWord.definitions].map((definitionGroup) => definitionGroup.toObject());
        definitions.forEach((definitionGroup: Interfaces.DefinitionSchema) => {
          const existingDefinitionGroupIndex = updatedDefinitions
            .findIndex(({ wordClass }) => definitionGroup.wordClass === wordClass);
          if (existingDefinitionGroupIndex !== -1) {
            updatedDefinitions[existingDefinitionGroupIndex] = {
              ...updatedDefinitions[existingDefinitionGroupIndex],
              definitions: Array.from(
                new Set([...updatedDefinitions[existingDefinitionGroupIndex].definitions,
                  ...definitionGroup.definitions]),
              ),
            };
          } else {
            updatedDefinitions.push(definitionGroup);
          }
        });
        updatedWord.definitions = updatedDefinitions;
        updatedWord.variations = Array.from(new Set([...updatedWord.variations, ...variations]));
        updatedWord.stems = Array.from(new Set([...(updatedWord.stems || []), ...(stems || [])]));
        updatedWord.relatedTerms = Array.from(new Set([...updatedWord.relatedTerms, ...relatedTerms]));
        updatedWord.hypernyms = Array.from(new Set([...updatedWord.hypernyms, ...hypernyms]));
        updatedWord.hyponyms = Array.from(new Set([...updatedWord.hyponyms, ...hyponyms]));
        updatedWord.nsibidi = updatedWord.nsibidi || nsibidi;

        /* Deletes the specified word and connected wordSuggestions regardless of their merged status */
        await Word.deleteOne({ _id: toBeDeletedWordId });
        await deleteWordSuggestionsByOriginalWordId(toBeDeletedWordId, mongooseConnection);
        await replaceWordIdsFromExampleAssociatedWords(toBeDeletedWordExamples, toBeDeletedWordId, primaryWordId);
        // Returns the result
        return updatedWord.save();
      },
    );
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
    const { mongooseConnection } = req;
    const { id } = req.params;
    const WordSuggestion = mongooseConnection.model('WordSuggestion', wordSuggestionSchema);

    const wordSuggestions = await WordSuggestion.find(searchForAssociatedSuggestions(id));
    return res.send(wordSuggestions);
  } catch (err) {
    return next(err);
  }
};

/* Grabs all Word Suggestions that are associated with a Word document by looking at the Twitter Id */
export const getAssociatedWordSuggestionsByTwitterId = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const WordSuggestion = mongooseConnection.model('WordSuggestion', wordSuggestionSchema);

    const wordSuggestions = await WordSuggestion.find(searchForAssociatedSuggestionsByTwitterId(id));
    return res.send(wordSuggestions);
  } catch (err) {
    return next(err);
  }
};

/* Returns all the WordSuggestions with audio pronunciations */
export const getTotalWordsWithAudioPronunciations = (mongooseConnection): Promise<any> => {
  const Word = mongooseConnection.model('Word', wordSchema);
  return Word
    .find(searchForAllWordsWithAudioPronunciations())
    .lean()
    .exec();
};

/* Returns all the WordSuggestions that's in Standard Igbo */
export const getTotalWordsInStandardIgbo = (mongooseConnection): Promise<any> => {
  const Word = mongooseConnection.model('Word', wordSchema);

  return Word
    .find(searchForAllWordsWithIsStandardIgbo())
    .lean()
    .exec();
};
