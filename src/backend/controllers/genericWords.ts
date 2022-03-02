/* eslint-disable import/extensions */
import {
  assign,
  every,
  has,
  partial,
  map,
  trim,
} from 'lodash';
import mongoose from 'mongoose';
import * as functions from 'firebase-functions';
import testGenericWordsDictionary from 'src/tests/__mocks__/genericWords_mock';
import GenericWord from '../models/GenericWord';
import genericWordsDictionary from '../dictionaries/ig-en/ig-en_normalized_expanded.json';
import SortingDirections from '../shared/constants/sortingDirections';
import UserRoles from '../shared/constants/UserRoles';
import { packageResponse, handleQueries, populateFirebaseUsers } from './utils';
import {
  searchForLastWeekQuery,
  searchPreExistingGenericWordsRegexQuery,
  searchPreExistingGenericWordsRegexQueryAsEditor,
} from './utils/queries';
import {
  handleDeletingExampleSuggestions,
  getExamplesFromClientData,
  updateNestedExampleSuggestions,
  placeExampleSuggestionsOnSuggestionDoc,
} from './utils/nestedExampleSuggestionUtils';
import GenericWordSegments from '../shared/constants/GenericWordSegments';
import Dialects from '../shared/constants/Dialects';

const REQUIRE_KEYS = ['word', 'wordClass', 'definitions'];
const config = functions.config();

/* Updates an existing WordSuggestion object */
export const putGenericWord = async (req, res, next) => {
  try {
    const { body: data, params: { id } } = req;
    const clientExamples = getExamplesFromClientData(data);

    if (!every(REQUIRE_KEYS, partial(has, data))) {
      throw new Error('Required information is missing, double check your provided data');
    }

    if (!Array.isArray(data.definitions)) {
      data.definitions = map(data.definitions.split(','), (definition) => trim(definition));
    }

    const updatedAndSavedGenericWord = await GenericWord.findById(id)
      .then(async (genericWord) => {
        if (!genericWord) {
          throw new Error('Generic word doesn\'t exist');
        }
        const updatedGenericWord = assign(genericWord, data);
        await handleDeletingExampleSuggestions({ suggestionDoc: genericWord, clientExamples });

        /* Updates all the word's children exampleSuggestions */
        await updateNestedExampleSuggestions({ suggestionDocId: genericWord.id, clientExamples });

        await updatedGenericWord.save();
        const savedGenericWord = await placeExampleSuggestionsOnSuggestionDoc(updatedGenericWord);
        return savedGenericWord;
      });
    return res.send(updatedAndSavedGenericWord);
  } catch (err) {
    return next(err);
  }
};

/* Depending on the editor's groupNumber, they will have access to
 * they'll be assigned to a different segment of genericWords */
const determineSegment = (groupNumber) => {
  switch (groupNumber) {
    case 1:
      return GenericWordSegments.FIRST_GROUP;
    case 2:
      return GenericWordSegments.SECOND_GROUP;
    case 3:
      return GenericWordSegments.THIRD_GROUP;
    default:
      return GenericWordSegments.FIRST_GROUP;
  }
};

/* Only returns words by their id if they are in the editor's genericWords segment */
export const findGenericWordByIdAsEditor = (id, groupNumber) => {
  const genericWordSegment = determineSegment(groupNumber);
  return GenericWord.findOne({ _id: mongoose.Types.ObjectId(id), word: { $regex: genericWordSegment } });
};

export const findGenericWordById = (id) => (
  GenericWord.findById(id)
);

/* Pushed most updated documents to the back of the list for editors */
const findGenericWordsAsEditor = async ({ regexMatch, skip, limit }) => (
  GenericWord
    .find(regexMatch)
    .sort({ updatedAt: SortingDirections.ASCENDING })
    .skip(skip)
    .limit(limit)
);

/* Grabs GenericWords */
export const findGenericWords = async ({ regexMatch, skip, limit }) => (
  GenericWord
    .find(regexMatch)
    .skip(skip)
    .limit(limit)
);

/* Returns all existing GenericWord objects */
export const getGenericWords = (req, res, next) => {
  try {
    const {
      regexKeyword,
      skip,
      limit,
      user,
      ...rest
    } = handleQueries(req);
    const { role, editingGroup } = user;
    const regexMatch = role === UserRoles.EDITOR
      ? searchPreExistingGenericWordsRegexQueryAsEditor(determineSegment(editingGroup), regexKeyword)
      : searchPreExistingGenericWordsRegexQuery(regexKeyword);
    const foundGenericWords = role === UserRoles.EDITOR
      ? findGenericWordsAsEditor({ regexMatch, skip, limit })
      : findGenericWords({ regexMatch, skip, limit });
    return foundGenericWords
      .then(async (genericWords) => {
        /* Places the exampleSuggestions on the corresponding genericWords */
        const genericWordsWithExamples = await Promise.all(
          map(genericWords, placeExampleSuggestionsOnSuggestionDoc),
        );
        const packagedResponse = await packageResponse({
          res,
          docs: genericWordsWithExamples,
          model: GenericWord,
          query: regexMatch,
          ...rest,
        });
        return packagedResponse;
      })
      .catch(() => {
        throw new Error('An error has occurred while returning all generic words');
      });
  } catch (err) {
    return next(err);
  }
};

/* Returns a single WordSuggestion by using an id */
export const getGenericWord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, editingGroup } = req.user;
    const genericWord = (role === UserRoles.EDITOR
      ? await findGenericWordByIdAsEditor(id, editingGroup)
      : await findGenericWordById(id));

    if (!genericWord) {
      throw new Error('No genericWord exists with the provided id.');
    }
    const genericWordWithExamples = await placeExampleSuggestionsOnSuggestionDoc(genericWord);
    const populatedUsersGenericWordWithExamples = await populateFirebaseUsers(
      genericWordWithExamples,
      ['approvals', 'denials'],
    );
    return res.send(populatedUsersGenericWordWithExamples);
  } catch (err) {
    return next(err);
  }
};

const seedGenericWords = async (dictionary) => (
  map(dictionary, (value, key) => {
    const newGenericWord = new GenericWord({
      word: key,
      definitions: value,
      dialects: Object.values(Dialects).reduce((dialectsObject, { value }) => ({
        ...dialectsObject,
        [value]: {
          word: '',
          dialect: value,
          variations: '',
          pronunciation: '',
        },
      }), {}),
    });
    return newGenericWord.save();
  })
);

/* Populates the MongoDB database with GenericWords */
export const createGenericWords = async (_, res, next) => {
  try {
    const dictionary = process.env.NODE_ENV === 'test' || process.env.CI || config?.runtime?.env === 'cypress'
      ? testGenericWordsDictionary
      : genericWordsDictionary;
    const genericWordsPromises = await seedGenericWords(dictionary);
    const genericWords = await Promise.all(genericWordsPromises)
      .then(() => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('✅ Seeding successful for genericWords');
        }
        return 'Successfully populated generic words';
      });
    return res.send(genericWords);
  } catch (err) {
    return next(err);
  }
};

/* Deletes a single GenericWord by using an id */
export const deleteGenericWord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedGenericWord = await GenericWord.findByIdAndDelete(id)
      .then((genericWord) => {
        if (!genericWord) {
          throw new Error('No generic word exists with the provided id.');
        }
        return genericWord;
      });
    return res.send(deletedGenericWord);
  } catch (err) {
    return next(err);
  }
};

/* Returns all the GenericWords from last week */
export const getGenericWordsFromLastWeek = () => (
  GenericWord
    .find(searchForLastWeekQuery())
    .lean()
    .exec()
);
