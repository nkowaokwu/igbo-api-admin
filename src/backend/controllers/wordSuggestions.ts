import { Connection, Document, Model, Query, Types } from 'mongoose';
import { Response, NextFunction } from 'express';
import { assign, compact, map, omit } from 'lodash';
import { wordSchema } from 'src/backend/models/Word';
import Author from 'src/backend/shared/constants/Author';
import { wordSuggestionSchema } from '../models/WordSuggestion';
import { exampleSuggestionSchema } from '../models/ExampleSuggestion';
import { packageResponse, handleQueries, populateFirebaseUsers } from './utils';
import {
  searchPreExistingWordSuggestionsRegexQuery,
  searchWordSuggestionsOlderThanAYear,
  searchWordSuggestionsWithoutIgboDefinitionsFromLastMonth,
  searchWordsWithoutIgboDefinitions,
} from './utils/queries';
import * as Interfaces from './utils/interfaces';
import {
  handleDeletingExampleSuggestions,
  getExamplesFromClientData,
  updateNestedExampleSuggestions,
  placeExampleSuggestionsOnSuggestionDoc,
} from './utils/nestedExampleSuggestionUtils';
import SuggestionTypeEnum from '../shared/constants/SuggestionTypeEnum';
import { sendRejectedEmail } from './email';
import { findUser } from './users';
import { deleteAudioPronunciation } from './utils/MediaAPIs/AudioAPI';
import CrowdsourcingType from '../shared/constants/CrowdsourcingType';
import assignEditorsToDialects from './utils/assignEditorsToDialects';

const OBJECTID_LENGTH = 24;
const RANDOM_WORDS_LIMIT = 5;

export const createWordSuggestion = async ({
  data,
  word,
  user,
  mongooseConnection,
}: {
  data: any;
  word: Interfaces.Word;
  user: { uid: string };
  mongooseConnection: Connection;
}): Promise<Interfaces.WordSuggestion> => {
  let wordSuggestion;
  const { projectId } = req.query;
  try {
    const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
    data.authorId = user.uid;
    data = assignEditorsToDialects({
      clientData: data,
      compareData: word,
      userId: user.uid,
    });
    data = assign(data, { projectId });
    const clientExamples = getExamplesFromClientData(data);
    const newWordSuggestion = new WordSuggestion(data);
    wordSuggestion = (await newWordSuggestion.save()) as Interfaces.WordSuggestion;
    await updateNestedExampleSuggestions({
      suggestionDocId: wordSuggestion.id.toString(),
      clientExamples,
      mongooseConnection,
      user,
    });
    const savedWordSuggestion = await placeExampleSuggestionsOnSuggestionDoc(wordSuggestion, mongooseConnection);
    return savedWordSuggestion;
  } catch (err) {
    console.log('Unable to create word suggestion', err);
    if (wordSuggestion?.delete) {
      await wordSuggestion.delete();
    }
    throw err;
  }
};

/* Creates a new WordSuggestion document in the database */
export const postWordSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { body: rawData, word, user, mongooseConnection } = req;
    const { projectId } = req.query;
    const data = { ...rawData, projectId };

    const savedWordSuggestion = await createWordSuggestion({
      data,
      word,
      user,
      mongooseConnection,
    });
    return res.send(savedWordSuggestion);
    // console.log('An error occurred while posting new word suggestion:', error.message);
    // console.log('Deleting the associated word document to avoid producing duplicates');
  } catch (err) {
    return next(err);
  }
};

export const findWordSuggestionById = (
  id: string | Types.ObjectId,
  projectId: string,
  mongooseConnection: Connection,
): Query<any, Document<Interfaces.WordSuggestion>> => {
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
  return WordSuggestion.findOne({ _id: id, projectId });
};

export const deleteWordSuggestionsByOriginalWordId = (
  id: string | Types.ObjectId,
  projectId: string,
  mongooseConnection: Connection,
): Query<any, Document<Interfaces.WordSuggestion>> => {
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
  return WordSuggestion.deleteMany({ originalWordId: id, projectId });
};

/* Grabs WordSuggestions */
const findWordSuggestions = async ({
  regexMatch,
  skip,
  limit,
  mongooseConnection,
}: {
  regexMatch: RegExp;
  skip: number;
  limit: number;
  mongooseConnection: Connection;
}): Promise<Interfaces.WordSuggestion[] | any> => {
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
  return WordSuggestion.find(regexMatch, null, { sort: { updatedAt: -1 } })
    .skip(skip)
    .limit(limit);
};

/* Updates an existing WordSuggestion object */
export const putWordSuggestion = (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> | void => {
  try {
    const {
      body: rawData,
      params: { id },
      query: { projectId },
      user,
      mongooseConnection,
    } = req;
    let data = rawData;
    const clientExamples = getExamplesFromClientData(data);

    return findWordSuggestionById(id, projectId, mongooseConnection)
      .then(async (wordSuggestion: Interfaces.WordSuggestion) => {
        if (!wordSuggestion) {
          throw new Error("Word suggestion doesn't exist");
        }

        if (wordSuggestion.merged) {
          res.status(400);
          throw new Error('Unable to edit a merged word suggestion');
        }

        data = omit(data, ['authorId', 'author']);
        data = assignEditorsToDialects({
          clientData: data,
          compareData: wordSuggestion,
          userId: user.uid,
        });
        const updatedWordSuggestion = assign(wordSuggestion, data);
        // Cleans malformed data where a stem or relatedTerm isn't not a valid ObjectId
        updatedWordSuggestion.stems = updatedWordSuggestion?.stems?.filter(
          (stem) => stem.toString().length === OBJECTID_LENGTH,
        );
        updatedWordSuggestion.relatedTerms = updatedWordSuggestion?.relatedTerms?.filter(
          (relatedTerm) => relatedTerm.toString().length === OBJECTID_LENGTH,
        );
        await handleDeletingExampleSuggestions({ suggestionDoc: wordSuggestion, clientExamples, mongooseConnection });

        /* Updates all the word's children exampleSuggestions */
        await updateNestedExampleSuggestions({
          suggestionDocId: wordSuggestion.id.toString(),
          clientExamples,
          mongooseConnection,
          user,
        });
        /* We call updatedWordSuggestion.save() before handling audio pronunciations to work with only URIs */
        await updatedWordSuggestion.save();

        const savedWordSuggestion = await placeExampleSuggestionsOnSuggestionDoc(
          updatedWordSuggestion,
          mongooseConnection,
        );
        return res.send(savedWordSuggestion);
      })
      .catch(next);
  } catch (err) {
    return next(err);
  }
};

/* Returns all existing WordSuggestion objects */
export const getWordSuggestions = (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> | void => {
  try {
    const { regexKeyword, skip, limit, filters, user, mongooseConnection, ...rest } = handleQueries(req);
    const { projectId } = req.query;
    const regexMatch = searchPreExistingWordSuggestionsRegexQuery(regexKeyword, projectId, filters);
    const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);

    // console.time('Get word suggestions');
    return findWordSuggestions({
      regexMatch,
      skip,
      limit,
      mongooseConnection,
    })
      .then(async (wordSuggestions: [Interfaces.WordSuggestion]) => {
        /* Places the exampleSuggestions on the corresponding wordSuggestions */
        const wordSuggestionsWithExamples = await Promise.all(
          map(wordSuggestions, (wordSuggestion) =>
            placeExampleSuggestionsOnSuggestionDoc(wordSuggestion, mongooseConnection),
          ),
        );
        // console.timeEnd('Get word suggestions');
        return packageResponse({
          res,
          docs: wordSuggestionsWithExamples,
          model: WordSuggestion,
          query: regexMatch,
          ...rest,
        });
      })
      .catch(next);
  } catch (err) {
    return next(err);
  }
};

/* Returns a single WordSuggestion by using an id */
export const getWordSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const { projectId } = req.query;
    const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
    const populatedWordSuggestion: Document<Interfaces.WordSuggestion> = await WordSuggestion.findOne({
      _id: id,
      projectId,
    }).then(async (wordSuggestion: Interfaces.WordSuggestion) => {
      if (!wordSuggestion) {
        throw new Error(`No word suggestion exists with the provided id: ${id}`);
      }
      const wordSuggestionWithExamples = await placeExampleSuggestionsOnSuggestionDoc(
        wordSuggestion,
        mongooseConnection,
      );
      const populatedUsersWordSuggestionWithExamples = await populateFirebaseUsers(wordSuggestionWithExamples, [
        'approvals',
        'denials',
      ]);
      return populatedUsersWordSuggestionWithExamples;
    });
    return res.send(populatedWordSuggestion);
  } catch (err) {
    return next(err);
  }
};

/** Deletes ExampleSuggestions that have no associated words left after
 * deleting a WordSuggestion or filters out the associated WordSuggestion id
 * if there are more than one associated words.
 */
export const deleteAssociatedExampleSuggestions = async ({
  ExampleSuggestion,
  wordSuggestionId,
}: {
  ExampleSuggestion: Model<Interfaces.ExampleSuggestion>;
  wordSuggestionId: string;
}): Promise<void> => {
  const exampleSuggestions = await ExampleSuggestion.find({ associatedWords: wordSuggestionId });
  await Promise.all(
    exampleSuggestions.map(async (exampleSuggestion) => {
      if (exampleSuggestion?.associatedWords.length <= 1) {
        await ExampleSuggestion.findByIdAndDelete(exampleSuggestion.id);
      } else {
        exampleSuggestion.associatedWords = exampleSuggestion.associatedWords.filter(
          (associatedWord) => associatedWord.toString() !== wordSuggestionId,
        );
        await exampleSuggestion.save();
      }
    }),
  );
};

/* Deletes the provided word suggestion and associated data */
export const deleteWordSuggestionData = async ({
  ExampleSuggestion,
  wordSuggestion,
}: {
  ExampleSuggestion: Model<Interfaces.ExampleSuggestion>;
  wordSuggestion: Interfaces.WordSuggestion;
}): Promise<Interfaces.WordSuggestion> => {
  const id = wordSuggestion.id.toString();
  /* Deletes all word pronunciations for the headword and dialects */
  const isPronunciationMp3 = wordSuggestion.pronunciation && wordSuggestion.pronunciation.includes('mp3');
  await deleteAudioPronunciation(id, isPronunciationMp3);
  await Promise.all(
    wordSuggestion.dialects.map(async ({ pronunciation, word: dialectalWord, _id: dialectalWordId }) => {
      const dialectPronunciationMp3 = pronunciation && pronunciation.includes('mp3');
      deleteAudioPronunciation(`${id}-${dialectalWord}`, dialectPronunciationMp3);
      deleteAudioPronunciation(`${id}-${dialectalWordId}`, dialectPronunciationMp3);
    }),
  );
  const { email: userEmail } = (await findUser(wordSuggestion.authorId).catch(() => ({
    // console.log("THe user doesn't exist.");
    // console.log(err);
    email: null,
  }))) as Interfaces.FormattedUser;
  /* Sends rejection email to user if they provided an email and the wordSuggestion isn't merged */
  if (userEmail && !wordSuggestion.merged) {
    sendRejectedEmail({
      to: [userEmail],
      suggestionType: SuggestionTypeEnum.WORD,
      ...wordSuggestion.toObject(),
    });
  }
  await deleteAssociatedExampleSuggestions({ ExampleSuggestion, wordSuggestionId: id });
  return wordSuggestion;
};

/* Deletes a single WordSuggestion by using an id */
export const deleteWordSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const { projectId } = req.query;
    const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );
    const result = await WordSuggestion.findOneAndDelete({ _id: id, projectId, merged: null })
      .then(async (wordSuggestion: Interfaces.WordSuggestion) => {
        if (!wordSuggestion) {
          throw new Error('No word suggestion exists with the provided id.');
        }
        return deleteWordSuggestionData({ ExampleSuggestion, wordSuggestion });
      })
      .catch((err) => {
        throw new Error(err.message || 'An error has occurred while deleting and return a single word suggestion');
      });

    return res.send(result);
  } catch (err) {
    return next(err);
  }
};

/* Deletes a batch of WordSuggestions by using ids */
export const bulkDeleteWordSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const { projectId } = req.query;
    const ids = req.body;
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );
    const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
    const result = await WordSuggestion.find({ _id: { $in: ids }, projectId, merged: null })
      .then(async (wordSuggestions: Interfaces.WordSuggestion[]) => {
        if (!wordSuggestions) {
          throw new Error('No word suggestions exist with the provided id.');
        }

        return Promise.all(
          wordSuggestions.map((wordSuggestion) => deleteWordSuggestionData({ ExampleSuggestion, wordSuggestion })),
        );
      })
      .catch((err) => {
        throw new Error(err.message || 'An error has occurred while deleting and return a single word suggestion');
      });
    return res.send(result);
  } catch (err) {
    return next(err);
  }
};

/* Deletes Word Suggestions that are older than a year */
export const deleteOldWordSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ success: boolean; result: any }> | void> => {
  try {
    const { mongooseConnection } = req;
    const { projectId } = req.query;
    const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
    const query = searchWordSuggestionsOlderThanAYear({ projectId });

    const result = await WordSuggestion.deleteMany(query);

    return res.send({ success: true, result });
  } catch (err) {
    return next(err);
  }
};

export const approveWordSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.WordSuggestion> | void> => {
  const {
    params: { id },
    query: { projectId },
    user,
    mongooseConnection,
  } = req;
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);

  try {
    const wordSuggestion = await WordSuggestion.findOne({ _id: id, projectId });
    if (!wordSuggestion) {
      throw new Error("Word suggestion doesn't exist");
    }
    const updatedApprovals = new Set(wordSuggestion.approvals);
    const updatedDenials = wordSuggestion.denials.filter((uid) => uid !== user.uid);
    updatedApprovals.add(user.uid);
    wordSuggestion.approvals = Array.from(updatedApprovals);
    wordSuggestion.denials = updatedDenials;
    const savedWordSuggestion = await wordSuggestion.save();
    return res.send(savedWordSuggestion);
  } catch (err) {
    return next(err);
  }
};

export const denyWordSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.WordSuggestion> | void> => {
  const {
    params: { id },
    query: { projectId },
    user,
    mongooseConnection,
  } = req;
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);

  try {
    const wordSuggestion = await WordSuggestion.findOne({ _id: id, projectId });
    if (!wordSuggestion) {
      throw new Error("Word suggestion doesn't exist");
    }
    const updatedDenials = new Set(wordSuggestion.denials);
    const updatedApprovals = wordSuggestion.approvals.filter((uid) => uid !== user.uid);
    updatedDenials.add(user.uid);
    wordSuggestion.denials = Array.from(updatedDenials);
    wordSuggestion.approvals = updatedApprovals;
    const savedWordSuggestion = await wordSuggestion.save();
    return res.send(savedWordSuggestion);
  } catch (err) {
    return next(err);
  }
};

/**
 * Gets five random Word Suggestions to be updated via crowdsourcing for Igbo Definitions
 */
export const getRandomWordSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.WordSuggestion[]> | void> => {
  const { mongooseConnection } = req;
  const { projectId } = req.query;
  const query = searchWordSuggestionsWithoutIgboDefinitionsFromLastMonth({ projectId });
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);

  try {
    const wordSuggestions = await WordSuggestion.find(query);
    return res.send(wordSuggestions.slice(0, RANDOM_WORDS_LIMIT));
  } catch (err) {
    return next(err);
  }
};

/* Updates the specified Word suggestions' Igbo definitions */
export const putRandomWordSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.WordSuggestion[]> | void> => {
  const { mongooseConnection, body: igboDefinitions } = req;
  const { projectId } = req.query;
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);

  try {
    const savedWordSuggestionIds = compact(
      await Promise.all(
        igboDefinitions.map(async ({ id, igboDefinition }) => {
          const wordSuggestion = await WordSuggestion.findOne({ _id: id, projectId });
          if (!wordSuggestion) {
            console.error('Silent failure: Word suggestion does not exist. Unable to update Igbo definition.');
            return null;
          }
          if (!Array.isArray(wordSuggestion.definitions[0].igboDefinitions)) {
            console.warn(`Word suggestion does not have an igboDefinitions array in the first definition group. 
        Unable to update ${wordSuggestion._id} word suggestion`);
          }
          wordSuggestion.definitions[0].igboDefinitions.push({
            igbo: igboDefinition,
            nsibidi: '',
          });
          wordSuggestion.crowdsourcing[CrowdsourcingType.INPUT_IGBO_DEFINITION] = true;
          const savedWordSuggestion = await wordSuggestion.save();
          return savedWordSuggestion._id.toString();
        }),
      ),
    );

    return res.send(savedWordSuggestionIds);
  } catch (err) {
    return next(err);
  }
};

/* Creates as many new Word Suggestions */
export const postRandomWordSuggestionsForIgboDefinitions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ message: boolean }> | void> => {
  const { mongooseConnection, body: data = {} } = req;
  const { projectId } = req.query;
  const Word = mongooseConnection.model<Interfaces.Word>('Word', wordSchema);
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);

  try {
    const WORD_LIMIT = data.limit ?? 5;
    const MAXIMUM_WORDS = 10;

    if (WORD_LIMIT > MAXIMUM_WORDS) {
      throw new Error('Too many word suggestions attempted to be created. Please reduce the amount.');
    }
    const OMIT_WORD_KEYS = ['_id', 'id', 'createdAt', 'updatedAt'];
    let createdWordSuggestionsCount = 0;
    const systemUser = {
      uid: Author.SYSTEM,
    };
    const query = searchWordsWithoutIgboDefinitions({ projectId });
    // Gets all Words in the database
    const words = await Word.find(query);

    if (!words || !words?.length) {
      return res.status(204).send({ message: 'No word suggestion created' });
    }

    // 🚨 This will be a time consuming function 🚨
    const wordSuggestionIds = compact(
      await Promise.all(
        words.map(async (word) => {
          if (createdWordSuggestionsCount >= WORD_LIMIT) {
            return null;
          }
          const wordData = omit(assign(word), OMIT_WORD_KEYS) as Interfaces.WordSuggestion;
          wordData.originalWordId = word.id;
          wordData.projectId = projectId;
          // Checks to see if an existing Word Suggestion exists for the Word
          const existingWordSuggestion = await WordSuggestion.findOne({ originalWordId: word.id, projectId });

          // If a Word Suggestion already exists, a new Word Suggestion will not be created from this Word
          if (existingWordSuggestion?.id) {
            return null;
          }
          // If no Word Suggestion already exists, a new Word Suggestion will be created from this Word
          const savedWordSuggestion = await createWordSuggestion({
            data: wordData,
            word,
            user: systemUser,
            mongooseConnection,
          });
          createdWordSuggestionsCount += 1;
          return savedWordSuggestion.id;
        }),
      ),
    );

    return res
      .status(201)
      .send({ message: `Created up to ${wordSuggestionIds.length} word suggestions`, ids: wordSuggestionIds });
  } catch (err) {
    return next(err);
  }
};
