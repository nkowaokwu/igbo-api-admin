import {
  Connection,
  Document,
  Query,
  Types,
} from 'mongoose';
import { Response, NextFunction } from 'express';
import {
  assign,
  compact,
  map,
  omit,
} from 'lodash';
import { wordSuggestionSchema } from '../models/WordSuggestion';
import { exampleSuggestionSchema } from '../models/ExampleSuggestion';
import { wordSchema } from '../models/Word';
import { packageResponse, handleQueries, populateFirebaseUsers } from './utils';
import {
  searchForLastWeekQuery,
  searchPreExistingWordSuggestionsRegexQuery,
  searchWordsWithoutIgboDefinitions,
} from './utils/queries';
import * as Interfaces from './utils/interfaces';
import {
  handleDeletingExampleSuggestions,
  getExamplesFromClientData,
  updateNestedExampleSuggestions,
  placeExampleSuggestionsOnSuggestionDoc,
} from './utils/nestedExampleSuggestionUtils';
import SuggestionTypes from '../shared/constants/SuggestionTypes';
import { sendRejectedEmail } from './email';
import { findUser } from './users';
import { deleteAudioPronunciation } from './utils/MediaAPIs/AudioAPI';
import CrowdsourcingType from '../shared/constants/CrowdsourcingType';

const OBJECTID_LENGTH = 24;
const RANDOM_WORDS_LIMIT = 5;
const assignEditorsToDialects = ({
  clientData,
  compareData,
  userId,
} : {
  clientData: Interfaces.WordSuggestion,
  compareData: Interfaces.Word | Interfaces.WordSuggestion,
  userId: string,
}) => {
  const updatedData = assign(clientData);
  if (!updatedData.dialects) {
    updatedData.dialects = [];
  }
  // Sets all newly created dialects' editor to the current user
  // if the word suggestion doesn't come from an existing word document
  if (!compareData) {
    updatedData.dialects = (clientData?.dialects || []).map((dialect) => ({
      ...dialect,
      editor: userId,
    }));
  } else {
    updatedData.dialects.forEach((_, index) => {
      const wordDialect = compareData.dialects[index];

      if (!wordDialect) {
        updatedData.dialects[index].editor = userId;
      } else {
        updatedData.dialects[index].editor = wordDialect?.editor;
      }
    });
  }
  return updatedData;
};

export const createWordSuggestion = async ({
  data,
  word,
  user,
  mongooseConnection,
} : {
  data: any,
  word: Interfaces.Word,
  user: Interfaces.FirebaseUser,
  mongooseConnection: Connection,
}): Promise<Interfaces.WordSuggestion> => {
  let wordSuggestion;
  try {
    const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
    data.authorId = user.uid;
    data = assignEditorsToDialects({
      clientData: data,
      compareData: word,
      userId: user.uid,
    });
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
    if (wordSuggestion) {
      wordSuggestion.delete();
    }
    throw err;
  };
};

/* Creates a new WordSuggestion document in the database */
export const postWordSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const {
      body: rawData,
      word,
      user,
      mongooseConnection,
    } = req;
    const data = rawData;

    try {
      const savedWordSuggestion = await createWordSuggestion({
        data,
        word,
        user,
        mongooseConnection,
      });
      return res.send(savedWordSuggestion);
    } catch (error) {
      console.log('An error occurred while posting new word suggestion:', error.message);
      console.log('Deleting the associated word document to avoid producing duplicates');
      throw error;
    }
  } catch (err) {
    return next(err);
  }
};

export const findWordSuggestionById = (id: string | Types.ObjectId, mongooseConnection: Connection)
: Query<any, Document<Interfaces.WordSuggestion>> => {
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
  return WordSuggestion.findById(id);
};

export const deleteWordSuggestionsByOriginalWordId = (id: string | Types.ObjectId, mongooseConnection: Connection)
: Query<any, Document<Interfaces.WordSuggestion>> => {
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
  return WordSuggestion.deleteMany({ originalWordId: id });
};

/* Grabs WordSuggestions */
const findWordSuggestions = async ({
  regexMatch,
  skip,
  limit,
  mongooseConnection,
} : {
  regexMatch: RegExp,
  skip: number,
  limit: number,
  mongooseConnection: Connection,
}): Promise<Interfaces.WordSuggestion[] | any> => {
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
  return WordSuggestion
    .find(regexMatch, null, { sort: { updatedAt: -1 } })
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
      user,
      mongooseConnection,
    } = req;
    let data = rawData;
    const clientExamples = getExamplesFromClientData(data);

    return findWordSuggestionById(id, mongooseConnection)
      .then(async (wordSuggestion: Interfaces.WordSuggestion) => {
        if (!wordSuggestion) {
          throw new Error('Word suggestion doesn\'t exist');
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
        updatedWordSuggestion.stems = (
          updatedWordSuggestion?.stems
            ?.filter((stem) => stem.toString().length === OBJECTID_LENGTH)
        );
        updatedWordSuggestion.relatedTerms = (
          updatedWordSuggestion?.relatedTerms
            ?.filter((relatedTerm) => relatedTerm.toString().length === OBJECTID_LENGTH)
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

        const savedWordSuggestion = (
          await placeExampleSuggestionsOnSuggestionDoc(updatedWordSuggestion, mongooseConnection)
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
    const {
      regexKeyword,
      skip,
      limit,
      filters,
      user,
      mongooseConnection,
      ...rest
    } = handleQueries(req);
    const regexMatch = searchPreExistingWordSuggestionsRegexQuery(user.uid, regexKeyword, filters);
    const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);

    console.time('Get word suggestions');
    return findWordSuggestions({
      regexMatch,
      skip,
      limit,
      mongooseConnection,
    })
      .then(async (wordSuggestions: [Interfaces.WordSuggestion]) => {
        /* Places the exampleSuggestions on the corresponding wordSuggestions */
        const wordSuggestionsWithExamples = await Promise.all(
          map(wordSuggestions, (wordSuggestion) => (
            placeExampleSuggestionsOnSuggestionDoc(wordSuggestion, mongooseConnection)
          )),
        );
        console.timeEnd('Get word suggestions');
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
    const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
    const populatedWordSuggestion: Document<Interfaces.WordSuggestion> = await WordSuggestion
      .findById(id)
      .then(async (wordSuggestion: Interfaces.WordSuggestion) => {
        if (!wordSuggestion) {
          throw new Error('No word suggestion exists with the provided id.');
        }
        const wordSuggestionWithExamples = (
          await placeExampleSuggestionsOnSuggestionDoc(wordSuggestion, mongooseConnection)
        );
        const populatedUsersWordSuggestionWithExamples = await populateFirebaseUsers(
          wordSuggestionWithExamples,
          ['approvals', 'denials'],
        );
        return populatedUsersWordSuggestionWithExamples;
      });
    return res.send(populatedWordSuggestion);
  } catch (err) {
    return next(err);
  }
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
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestionExampleSuggestion',
      exampleSuggestionSchema,
    );
    const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
    const result = await WordSuggestion.findOneAndDelete({ _id: id, merged: null })
      .then(async (wordSuggestion: Interfaces.WordSuggestion) => {
        if (!wordSuggestion) {
          throw new Error('No word suggestion exists with the provided id.');
        }
        /* Deletes all word pronunciations for the headword and dialects */
        const isPronunciationMp3 = wordSuggestion.pronunciation && wordSuggestion.pronunciation.includes('mp3');
        await deleteAudioPronunciation(id, isPronunciationMp3);
        await Promise.all(wordSuggestion.dialects.map(async ({
          pronunciation,
          word: dialectalWord,
          _id: dialectalWordId,
        }) => {
          const dialectPronunciationMp3 = pronunciation && pronunciation.includes('mp3');
          deleteAudioPronunciation(`${id}-${dialectalWord}`, dialectPronunciationMp3);
          deleteAudioPronunciation(`${id}-${dialectalWordId}`, dialectPronunciationMp3);
        }));
        const { email: userEmail } = await findUser(wordSuggestion.authorId)
          .catch((err) => {
            console.log('THe user doesn\'t exist.');
            console.log(err);
            return { email: null };
          }) as Interfaces.FormattedUser;
        /* Sends rejection email to user if they provided an email and the wordSuggestion isn't merged */
        if (userEmail && !wordSuggestion.merged) {
          sendRejectedEmail({
            to: [userEmail],
            suggestionType: SuggestionTypes.WORD,
            ...(wordSuggestion.toObject()),
          });
        }
        return wordSuggestion;
      })
      .catch((err) => {
        throw new Error(err.message || 'An error has occurred while deleting and return a single word suggestion');
      });
    await ExampleSuggestion.deleteMany({ associatedWords: id });
    return res.send(result);
  } catch (err) {
    return next(err);
  }
};

/* Returns all the WordSuggestions from last week */
export const getWordSuggestionsFromLastWeek = (mongooseConnection: Connection): Promise<any> => {
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
  return WordSuggestion
    .find(searchForLastWeekQuery())
    .lean()
    .exec();
};

export const getNonMergedWordSuggestions = (mongooseConnection: Connection):Promise<any> => {
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
  return WordSuggestion
    .find({ merged: null })
    .lean()
    .exec();
};

export const approveWordSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.WordSuggestion> | void> => {
  const { params: { id }, user, mongooseConnection } = req;
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);

  try {
    const wordSuggestion = await WordSuggestion.findById(id);
    if (!wordSuggestion) {
      throw new Error('Word suggestion doesn\'t exist');
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
  const { params: { id }, user, mongooseConnection } = req;
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);

  try {
    const wordSuggestion = await WordSuggestion.findById(id);
    if (!wordSuggestion) {
      throw new Error('Word suggestion doesn\'t exist');
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

/* Gets five random word suggestions to be updated via crowdsourcing */
export const getRandomWordSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.WordSuggestion[]> | void> => {
  const { user, mongooseConnection } = req;
  const query = searchWordsWithoutIgboDefinitions();
  const Word = mongooseConnection.model<Interfaces.Word>('Word', wordSchema);

  try {
    // Gets words that don't have Igbo definitions and don't
    // have an open word suggestion
    const words = await Word.aggregate()
      .match(query)
      .lookup({
        from: 'wordsuggestions',
        localField: '_id',
        foreignField: 'originalWordId',
        as: 'wordSuggestions',
      });

    const allWordSuggestions = compact(await Promise.all(words.map(async (word) => {
      // If the word document has a word suggestion that has no Igbo definitions
      // then the word suggestion will be returned to the client.
      if (word.wordSuggestions.length) {
        let existingWordSuggestion = null;
        for (let i = 0; i < word.wordSuggestions.length; i += 1) {
          const wordSuggestion = word.wordSuggestions[i];
          if (
            wordSuggestion.definitions[0]?.igboDefinitions
            && !wordSuggestion.definitions[0].igboDefinitions[0]
          ) {
            existingWordSuggestion = wordSuggestion;
            break;
          }
        }
        if (existingWordSuggestion) {
          return existingWordSuggestion;
        }
        return null;
      }

      // If the word doesn't have any word suggestions without Igbo definitions
      // then a new word suggestion will be created.
      const rawWord = word;
      rawWord.originalWordId = rawWord._id;
      delete rawWord.id;
      delete rawWord._id;

      req.body = rawWord;
      let wordSuggestion;
      try {
        wordSuggestion = await createWordSuggestion({
          data: rawWord,
          word,
          user,
          mongooseConnection,
        });
      } catch (err) {
        console.log('Unable to create word suggestion for Igbo definitions.');
        console.log(err.message);
      }
      return wordSuggestion;
    })));

    const wordSuggestions = allWordSuggestions.slice(0, RANDOM_WORDS_LIMIT);

    return res.send(wordSuggestions);
  } catch (err) {
    return next(err);
  }
};

/* Updates the specified Word suggestions' Igbo definitions */
export const putRandomWordSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
) : Promise<Response<Interfaces.WordSuggestion[]> | void> => {
  const { mongooseConnection, body: igboDefinitions } = req;
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);

  try {
    const savedWordSuggestionIds = await Promise.all(igboDefinitions.map(async ({ id, igboDefinition }) => {
      const wordSuggestion = await WordSuggestion.findById(id);
      if (!wordSuggestion) {
        throw new Error('Word suggestion does not exist. Unable to update Igbo definition.');
      } else if (!Array.isArray(wordSuggestion.definitions[0].igboDefinitions)) {
        console.warn(`Word suggestion does not have an igboDefinitions array in the first definition group. 
        Unable to update ${wordSuggestion._id} word suggestion`);
      }
      wordSuggestion.definitions[0].igboDefinitions.push({
        igbo: igboDefinition,
        nsibidi: '',
        nsibidiCharacters: [],
      });
      wordSuggestion.crowdsourcing[CrowdsourcingType.INPUT_IGBO_DEFINITION] = true;
      const savedWordSuggestion = await wordSuggestion.save();
      return savedWordSuggestion._id.toString();
    }));

    return res.send(savedWordSuggestionIds);
  } catch (err) {
    return next(err);
  }
};
