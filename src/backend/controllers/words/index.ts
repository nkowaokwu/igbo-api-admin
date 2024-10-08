import mongoose, { Connection, Document } from 'mongoose';
import { Response, NextFunction } from 'express';
import { assign, map, omit } from 'lodash';
import removePrefix from 'src/backend/shared/utils/removePrefix';
import { wordSchema } from 'src/backend/models/Word';
import { wordSuggestionSchema } from 'src/backend/models/WordSuggestion';
import { findSearchWord } from 'src/backend/services/words';
import SuggestionTypeEnum from 'src/backend/shared/constants/SuggestionTypeEnum';
import { NO_PROVIDED_TERM } from 'src/backend/shared/constants/errorMessages';
import WordClass from 'src/backend/shared/constants/WordClass';
import { getDocumentsIds } from 'src/backend/shared/utils/documentUtils';
import createRegExp from 'src/backend/shared/utils/createRegExp';
import { DICTIONARY_APP_URL } from 'src/backend/config';
import { assignExampleSuggestionToExampleData } from 'src/backend/controllers/utils/nestedExampleSuggestionUtils';
import createExample from 'src/backend/controllers/examples/helpers/createExample';
import findExampleByAssociatedWordId from 'src/backend/controllers/examples/helpers/findExampleByAssociatedWordId';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import { sortDocsBy, packageResponse, handleQueries, updateDocumentMerge } from '../utils';
import {
  searchIgboTextSearch,
  strictSearchIgboQuery,
  searchForAssociatedWordSuggestions,
  searchForAssociatedSuggestionsByTwitterId,
} from '../utils/queries';
import { findWordsWithMatch } from '../utils/buildDocs';
import { deleteWordSuggestionsByOriginalWordId } from '../wordSuggestions';
import { sendMergedEmail } from '../email';
import { renameAudioPronunciation } from '../utils/MediaAPIs/AudioAPI';
import * as Interfaces from '../utils/interfaces';
import {
  handleSyncingSynonyms,
  handleSyncingAntonyms,
  combineWords,
  replaceWordIdsFromExampleAssociatedWords,
} from './helpers';
import { onMergeConstructedTermPoll } from '../polls';

/* Gets words from JSON dictionary */
export const getWordData = (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Response | void => {
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
const searchWordUsingIgbo = async ({
  query,
  searchWord,
  mongooseConnection,
  ...rest
}: {
  query: any;
  searchWord: string;
  mongooseConnection: Connection;
}): Promise<Interfaces.Word[]> => {
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
    const {
      query: { projectId },
    } = req;
    const searchQueries = {
      searchWord,
      skip,
      limit,
      dialects,
      examples: true,
    };
    const query: {
      word?: any;
      text?: any;
      definitions?: any;
    } = !strict
      ? searchIgboTextSearch(searchWord, regexKeyword, projectId, filters)
      : strictSearchIgboQuery(searchWord, projectId);

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
export const getWord = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const { projectId } = req.query;
    const Word = mongooseConnection.model('Word', wordSchema);

    const updatedWord = await findWordsWithMatch({
      match: {
        _id: new mongoose.Types.ObjectId(id),
        projectId: new mongoose.Types.ObjectId(projectId),
      },
      examples: true,
      limit: 1,
      Word,
    }).then(async ([word]: Interfaces.Word[]) => {
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
  data: Interfaces.WordClientData | Interfaces.WordSuggestion | LeanDocument<Document<Interfaces.WordClientData>>,
  mongooseConnection: Connection,
): Promise<Interfaces.Word> => {
  const { examples, word, wordClass, definitions, variations, stems, dialects = {}, isStandardIgbo, ...rest } = data;

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
  const newWord: Interfaces.Word | any = new Word(wordData);
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

/**
 * After merging the word suggestion, we want to move all the nested
 * example suggestion data into the new Example documents
 * @param wordSuggestion
 * @param originalWord
 * @param mergedBy
 * @param mongooseConnection
 * @returns The updated word document
 */
const updateSuggestionAfterMerge = async (
  wordSuggestion: Interfaces.WordSuggestion,
  originalWord: Interfaces.Word,
  mergedBy: string,
  mongooseConnection: Connection,
): Promise<Interfaces.WordSuggestion> => {
  await assignExampleSuggestionToExampleData({
    wordSuggestion,
    originalWord,
    mergedBy,
    mongooseConnection,
  });
  const updatedSuggestionDoc: Interfaces.WordSuggestion | any = await updateDocumentMerge(
    wordSuggestion,
    originalWord.id.toString(),
    mergedBy,
  );
  return updatedSuggestionDoc;
};

/* Takes the suggestion word pronunciation and overwrites the existing Word document's pronunciation file */
const overwriteWordPronunciation = async (
  suggestion: Interfaces.WordSuggestion,
  word: Interfaces.Word,
): Promise<{ suggestion: Interfaces.WordSuggestion; word: Interfaces.Word }> => {
  try {
    /**
     * Creating AWS URI for word pronunciation
     * If the suggestion doesn't have a pronunciation, then an empty string
     * will be passed in to tell AWS to delete the audio record for the associated
     * Word document
     */
    const suggestionDocId = suggestion.pronunciation ? suggestion.id.toString() : '';
    const isMp3 = suggestion.pronunciation.includes('mp3');
    const finalPronunciationUri = await renameAudioPronunciation(suggestionDocId, word.id.toString(), isMp3);

    suggestion.pronunciation = finalPronunciationUri;
    word.pronunciation = finalPronunciationUri;

    // Since the word suggestion is no longer needed, we don't need to trigger any AudioAPI.ts functions
    suggestion.skipPronunciationHook = true;
    const suggestionDialects = suggestion.dialects || [];

    await Promise.all(
      suggestionDialects.map(async ({ pronunciation: suggestionPronunciation, _id: dialectalWordId }, index) => {
        const wordDocDialectalWordId = word.dialects[index]._id;
        const wordDialectPronunciationKey = `${word.id}-${wordDocDialectalWordId}`;
        const suggestionDialectPronunciationKey = `${suggestion.id}-${dialectalWordId}`;
        /**
         * If the Word dialect's pronunciation doesn't include the Word's id,
         * the dialect's pronunciation uri key will get updated
         */
        const suggestionDialectDocId = suggestionPronunciation ? suggestionDialectPronunciationKey : '';
        const isMp3 = suggestionPronunciation.includes('mp3');
        const finalDialectPronunciationUri = await renameAudioPronunciation(
          suggestionDialectDocId,
          wordDialectPronunciationKey,
          isMp3,
        ).catch((err) => {
          // console.log('Inside overwriteWordPronunciation dialects', err.message);
          throw err;
        });

        suggestion.dialects[index].pronunciation = finalDialectPronunciationUri;
        if (!word.dialects[index]) {
          // @ts-expect-error _id
          word.dialects[index] = {
            dialects: [],
            variations: [],
            pronunciation: '',
          };
        }
        word.dialects[index].pronunciation = finalDialectPronunciationUri;
      }),
    );

    // TODO: audio ids for dialects will use a different schema id since they change on each save
    return { suggestion, word };
  } catch (err) {
    // console.log('An error occurred while merging audio pronunciations failed:', err.message);
    // console.log('Deleting the associated word document to avoid producing duplicates');
    await word.delete();
    throw err;
  }
};

/* *
 * Merges new data into an existing Word document
 * Serves as a Mongoose post `findOneAndUpdate` hook
 * */
const mergeIntoWord = (
  suggestionDoc: Interfaces.WordSuggestion,
  mergedBy: string,
  mongooseConnection: Connection,
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
        throw new Error("Word doesn't exist");
      }

      // eslint-disable-next-line prefer-const
      let { suggestion, word } = await overwriteWordPronunciation(suggestionDoc, updatedWord);
      suggestion = await updateSuggestionAfterMerge(suggestion, word, mergedBy, mongooseConnection);

      // Save updates on Word Suggestion and Word
      await Promise.all([suggestion.save(), word.save()]);
      return (await findWordsWithMatch({ match: { _id: suggestionDocObject.originalWordId }, limit: 1, Word }))[0];
    })
    .catch((error) => {
      throw new Error(error.message);
    });
};

/* Creates a new Word document from an existing WordSuggestion document */
const createWordFromSuggestion = (
  suggestionDoc: Interfaces.WordSuggestion,
  mergedBy: string,
  mongooseConnection: Connection,
): Promise<Interfaces.Word> =>
  createWord(suggestionDoc.toObject(), mongooseConnection)
    .then(async (savedWord: Interfaces.Word) => {
      // eslint-disable-next-line prefer-const
      let { suggestion, word } = await overwriteWordPronunciation(suggestionDoc, savedWord);
      suggestion = await updateSuggestionAfterMerge(suggestion, word, mergedBy, mongooseConnection);

      const [, updatedWord] = await Promise.all([suggestion.save(), word.save()]);
      return updatedWord;
    })
    .catch((err) => {
      throw new Error(`An error occurred while saving the new word: ${err.message}`);
    });

/* Sends confirmation merged email to user if they provided an email */
const handleSendingMergedEmail = async (
  result: Interfaces.WordData & { authorEmail: string; origin: SuggestionSourceEnum; word: string },
): Promise<void> => {
  try {
    if (result.authorEmail) {
      sendMergedEmail({
        to: [result.authorEmail],
        suggestionType: SuggestionTypeEnum.WORD,
        submissionLink: `${DICTIONARY_APP_URL}/word?word=${result.word}`,
        ...result,
      });
    }
  } catch (err) {
    // console.log(err.message);
  }
};

/* Merges the existing WordSuggestion into either a brand
 * new Word document or merges into an existing Word document */
export const mergeWord = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { user, suggestionDoc, mongooseConnection } = req;
    const mergedWord: Document<Interfaces.Word> | any =
      (suggestionDoc.originalWordId
        ? await mergeIntoWord(suggestionDoc, user.uid, mongooseConnection)
        : await createWordFromSuggestion(suggestionDoc, user.uid, mongooseConnection)) || {};
    await handleSyncingSynonyms(mergedWord, mongooseConnection);
    await handleSyncingAntonyms(mergedWord, mongooseConnection);
    await handleSendingMergedEmail({
      ...(mergedWord.toObject ? mergedWord.toObject() : mergedWord),
      origin: suggestionDoc.origin,
      wordClass: WordClass[suggestionDoc.wordClass]?.label || 'No word class',
      authorEmail: suggestionDoc.authorEmail,
      authorId: suggestionDoc.authorId,
      editorsNotes: suggestionDoc.editorsNotes,
    });
    // Send a Slack notification and Tweet that we have merged a new word
    if (suggestionDoc.twitterPollId && !suggestionDoc.originalWordId) {
      onMergeConstructedTermPoll(mergedWord);
    }
    return res.send(mergedWord);
  } catch (err) {
    return next(err);
  }
};

const findAndUpdateWord = (
  id: string,
  projectId: string,
  mongooseConnection: Connection,
  cb: (value: Interfaces.Word) => Promise<Interfaces.Word | void>,
): Promise<Interfaces.Word> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(!id ? 'No word id provided' : 'Invalid word id provided');
  }
  const Word = mongooseConnection.model('Word', wordSchema);

  return Word.findOne({ _id: id, projectId }).then(async (word: Interfaces.Word) => {
    if (!word) {
      throw new Error("Word doesn't exist");
    }
    return cb(assign(word));
  });
};

/* Updates a Word document in the database */
export const putWord = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const {
      body: data,
      params: { id },
      query: { projectId },
      mongooseConnection,
    } = req;
    if (!data.word) {
      throw new Error('Required information is missing, double your provided data.');
    }

    const savedWord: Interfaces.Word = await findAndUpdateWord(id, projectId, mongooseConnection, (word) => {
      const updatedWord = assign(word, data);
      return updatedWord.save();
    });
    return res.send(savedWord);
  } catch (err) {
    return next(err);
  }
};

/* Deletes the specified Word document while moving its contents
 * to another Word document, which preserves the original Word
 * document's data */
export const deleteWord = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const {
      body: data,
      params: { id: toBeDeletedWordId },
      query: { projectId },
      mongooseConnection,
    } = req;
    const { primaryWordId }: { primaryWordId: string } = data;
    const Word = mongooseConnection.model('Word', wordSchema);

    const wordToDelete: Interfaces.Word = await Word.findById(toBeDeletedWordId);
    const toBeDeletedWordExamples: Interfaces.Example[] | any = await findExampleByAssociatedWordId(
      toBeDeletedWordId,
      mongooseConnection,
    );
    const savedCombinedWord = await findAndUpdateWord(
      primaryWordId,
      projectId,
      mongooseConnection,
      async (wordToCombine: Interfaces.Word) => {
        const updatedWord = combineWords({ wordToCombine, wordToDelete });

        /* Deletes the specified word and connected wordSuggestions regardless of their merged status */
        await Word.deleteOne({ _id: toBeDeletedWordId });
        await deleteWordSuggestionsByOriginalWordId(toBeDeletedWordId, projectId, mongooseConnection);
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
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const { projectId } = req.query;
    const WordSuggestion = mongooseConnection.model('WordSuggestion', wordSuggestionSchema);

    const wordSuggestions = await WordSuggestion.find(searchForAssociatedWordSuggestions(id, projectId));
    return res.send(wordSuggestions);
  } catch (err) {
    return next(err);
  }
};

/* Grabs all Word Suggestions that are associated with a Word document by looking at the Twitter Id */
export const getAssociatedWordSuggestionsByTwitterId = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const { projectId } = req.query;
    const WordSuggestion = mongooseConnection.model('WordSuggestion', wordSuggestionSchema);

    const wordSuggestions = await WordSuggestion.find(searchForAssociatedSuggestionsByTwitterId(id, projectId));
    return res.send(wordSuggestions);
  } catch (err) {
    return next(err);
  }
};
