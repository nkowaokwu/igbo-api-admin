import { Document, Query, Types } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import {
  assign,
  every,
  has,
  partial,
  map,
  trim,
} from 'lodash';
import WordSuggestion from '../models/WordSuggestion';
import { packageResponse, handleQueries, populateFirebaseUsers } from './utils';
import { searchForLastWeekQuery, searchPreExistingWordSuggestionsRegexQuery } from './utils/queries';
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

const REQUIRE_KEYS = ['word', 'wordClass', 'definitions'];

const assignDefaultDialectValues = (data: Interfaces.WordSuggestion) => (
  Object.entries(data.dialects || {}).reduce((finalDialects, [key, value]) => ({
    ...finalDialects,
    [key]: { ...value },
  }), {})
);

/* Creates a new WordSuggestion document in the database */
export const postWordSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { body: data, user } = req;

    if (data.id) {
      throw new Error('Cannot pass along an id for a new word suggestion');
    }

    data.authorId = user.uid;
    data.dialects = assignDefaultDialectValues(data); // Assigns default word values
    const clientExamples = getExamplesFromClientData(data);
    const newWordSuggestion = new WordSuggestion(data);
    const savedWordSuggestion: Document<Interfaces.WordSuggestion> = await newWordSuggestion.save()
      .then(async (wordSuggestion: Interfaces.WordSuggestion) => {
        await updateNestedExampleSuggestions({ suggestionDocId: wordSuggestion.id, clientExamples });
        const res = await placeExampleSuggestionsOnSuggestionDoc(wordSuggestion);
        return res;
      });
    return res.send(savedWordSuggestion);
  } catch (err) {
    return next(err);
  }
};

export const findWordSuggestionById = (id: string | Types.ObjectId)
: Query<any, Document<Interfaces.WordSuggestion>> => (
  WordSuggestion.findById(id)
);

export const deleteWordSuggestionsByOriginalWordId = (id: string | Types.ObjectId)
: Query<any, Document<Interfaces.WordSuggestion>> => (
  WordSuggestion.deleteMany({ originalWordId: id })
);

/* Grabs WordSuggestions */
const findWordSuggestions = async (
  { regexMatch, skip, limit }:
  { regexMatch: RegExp, skip: number, limit: number },
): Promise<Interfaces.WordSuggestion[] | any> => (
  WordSuggestion
    .find(regexMatch, null, { sort: { updatedAt: -1 } })
    .skip(skip)
    .limit(limit)
);

/* Updates an existing WordSuggestion object */
export const putWordSuggestion = (req: Request, res: Response, next: NextFunction): Promise<Response | void> | void => {
  try {
    const {
      body: data,
      params: { id },
    } = req;
    const clientExamples = getExamplesFromClientData(data);

    if (!every(REQUIRE_KEYS, partial(has, data))) {
      throw new Error('Required information is missing, double check your provided data');
    }

    if (!Array.isArray(data.definitions)) {
      data.definitions = map(data.definitions.split(','), (definition) => trim(definition));
    }

    return findWordSuggestionById(id)
      .then(async (wordSuggestion: Interfaces.WordSuggestion) => {
        if (!wordSuggestion) {
          throw new Error('Word suggestion doesn\'t exist');
        }

        delete data.authorId;
        const updatedWordSuggestion = assign(wordSuggestion, data);
        await handleDeletingExampleSuggestions({ suggestionDoc: wordSuggestion, clientExamples });

        /* Updates all the word's children exampleSuggestions */
        await updateNestedExampleSuggestions({ suggestionDocId: wordSuggestion.id, clientExamples });
        /* We call updatedWordSuggestion.save() before handling audio pronunciations to work with only URIs */
        await updatedWordSuggestion.save();

        const savedWordSuggestion = await placeExampleSuggestionsOnSuggestionDoc(updatedWordSuggestion);
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
      ...rest
    } = handleQueries(req);
    const regexMatch = searchPreExistingWordSuggestionsRegexQuery(regexKeyword, filters);
    return findWordSuggestions({ regexMatch, skip, limit })
      .then(async (wordSuggestions: [Interfaces.WordSuggestion]) => {
        /* Places the exampleSuggestions on the corresponding wordSuggestions */
        const wordSuggestionsWithExamples = await Promise.all(
          map(wordSuggestions, placeExampleSuggestionsOnSuggestionDoc),
        );
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
export const getWordSuggestion = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const populatedWordSuggestion: Document<Interfaces.WordSuggestion> = await WordSuggestion
      .findById(id)
      .then(async (wordSuggestion: Interfaces.WordSuggestion) => {
        if (!wordSuggestion) {
          throw new Error('No word suggestion exists with the provided id.');
        }
        const wordSuggestionWithExamples = await placeExampleSuggestionsOnSuggestionDoc(wordSuggestion);
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
export const deleteWordSuggestion = (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> | void => {
  try {
    const { id } = req.params;
    return WordSuggestion.findByIdAndDelete(id)
      .then(async (wordSuggestion: Interfaces.WordSuggestion) => {
        if (!wordSuggestion) {
          throw new Error('No word suggestion exists with the provided id.');
        }
        /* Deletes all word pronunciations for the headword and dialects */
        const isPronunciationMp3 = wordSuggestion.pronunciation && wordSuggestion.pronunciation.includes('mp3');
        await deleteAudioPronunciation(id, isPronunciationMp3);
        await Promise.all(Object.entries(wordSuggestion.dialects).map(async ([dialectalWord, { pronunciation }]) => {
          const dialectPronunciationMp3 = pronunciation && pronunciation.includes('mp3');
          deleteAudioPronunciation(`${id}-${dialectalWord}`, dialectPronunciationMp3);
        }));
        const { email: userEmail } = await findUser(wordSuggestion.authorId) as Interfaces.FormattedUser;
        /* Sends rejection email to user if they provided an email and the wordSuggestion isn't merged */
        if (userEmail && !wordSuggestion.merged) {
          sendRejectedEmail({
            to: [userEmail],
            suggestionType: SuggestionTypes.WORD,
            ...(wordSuggestion.toObject()),
          });
        }
        return res.send(wordSuggestion);
      })
      .catch(() => {
        throw new Error('An error has occurred while deleting and return a single word suggestion');
      });
  } catch (err) {
    return next(err);
  }
};

/* Returns all the WordSuggestions from last week */
export const getWordSuggestionsFromLastWeek = (): Promise<any> => (
  WordSuggestion
    .find(searchForLastWeekQuery())
    .lean()
    .exec()
);

export const getNonMergedWordSuggestions = ():Promise<any> => (
  WordSuggestion
    .find({ merged: null })
    .lean()
    .exec()
);
