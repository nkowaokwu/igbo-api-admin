import { Document, Query, Model } from 'mongoose';
import { Response } from 'express';
import stringSimilarity from 'string-similarity';
import diacriticless from 'diacriticless';
import { assign, isNaN, get, map, compact } from 'lodash';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import removePrefix from 'src/backend/shared/utils/removePrefix';
import createQueryRegex from 'src/backend/shared/utils/createQueryRegex';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import SortingDirections from 'src/backend/shared/constants/sortingDirections';
import { findUser } from '../users';

const DEFAULT_RESPONSE_LIMIT = 10;
const MAX_RESPONSE_LIMIT = 100;
const MATCHING_DEFINITION = 1000;
const SIMILARITY_FACTOR = 100;
const NO_FACTOR = 0;
const SECONDARY_KEY = 'definitions[0].definitions[0]';

/* Determines if an empty response should be returned
 * if the request comes from an unauthed user in production
 */
const constructRegexQuery = ({
  user,
  searchWord,
  example,
}: {
  user: Interfaces.FormattedUser;
  searchWord: string;
  example: string;
}) => {
  const queryValue = example || searchWord;
  return user.role &&
    (user.role === UserRoles.EDITOR || user.role === UserRoles.MERGER || user.role === UserRoles.ADMIN)
    ? createQueryRegex(queryValue)
    : queryValue
    ? createQueryRegex(queryValue)
    : { wordReg: /^[.{0,}\n{0,}]/, definitionsReg: /^[.{0,}\n{0,}]/ };
};

const fallbackUser = {
  uid: 'fallback-firebase-uid',
  id: 'fallback-firebase-uid',
  email: 'fallback@email.com',
  display: 'Fallback Author',
  role: 'editor',
};

/* Given a list of keys, where each key's value is a list of Firebase uids,
 * replace each uid with a user object */
export const populateFirebaseUsers = async (
  doc: { [key: string]: string | number | { [key: string]: string } },
  keys: string[],
): Promise<{ [key: string]: string | number | { [key: string]: string } }> => {
  const docWithPopulateFirebaseUsers = assign(doc);
  await Promise.all(
    map(keys, async (key) => {
      docWithPopulateFirebaseUsers[key] = await Promise.all(
        map(compact(docWithPopulateFirebaseUsers[key]), (id) =>
          findUser(id).catch(() => {
            console.warn(`The user with the id ${id} doesn't exist in this database`);
            return fallbackUser;
          }),
        ),
      );
    }),
  );
  const authorRes =
    (await findUser(docWithPopulateFirebaseUsers.authorId).catch(() => {
      console.warn(`The user with the id ${docWithPopulateFirebaseUsers.authorId} doesn't exist in this database`);
      return fallbackUser;
    })) || {};
  return assign(doc, { author: authorRes });
};

/* Sorts all the docs based on the provided searchWord */
export const sortDocsBy = (searchWord: string, docs: Interfaces.Word[], key: string): Interfaces.Word[] =>
  docs.sort((prevDoc, nextDoc) => {
    const normalizedSearchWord = searchWord.normalize('NFD');
    const prevDocValue = get(prevDoc, key);
    const nextDocValue = get(nextDoc, key);
    const prevDocDifference =
      stringSimilarity.compareTwoStrings(normalizedSearchWord, diacriticless(prevDocValue.normalize('NFD'))) *
        SIMILARITY_FACTOR +
      ((get(prevDoc, SECONDARY_KEY) || '').includes(normalizedSearchWord) ? MATCHING_DEFINITION : NO_FACTOR);
    const nextDocDifference =
      stringSimilarity.compareTwoStrings(normalizedSearchWord, diacriticless(nextDocValue.normalize('NFD'))) *
        SIMILARITY_FACTOR +
      ((get(nextDoc, SECONDARY_KEY) || '').includes(normalizedSearchWord) ? MATCHING_DEFINITION : NO_FACTOR);
    if (prevDocDifference === nextDocDifference) {
      return NO_FACTOR;
    }
    return prevDocDifference > nextDocDifference ? -1 : 1;
  });
/* Validates the provided range */
export const isValidRange = (range: number[]): boolean => {
  if (!Array.isArray(range)) {
    return false;
  }

  /* Invalid range if first element is larger than the second */
  if (range[0] >= range[1]) {
    return false;
  }

  const validRange = range;
  validRange[1] += 1;
  return !(validRange[1] - validRange[0] > MAX_RESPONSE_LIMIT) && !(validRange[1] - validRange[0] < 0);
};

/* Takes both page and range and converts them into appropriate skip and limit */
export const convertToSkipAndLimit = ({
  page,
  range,
}: {
  page: number;
  range: number[];
}): { skip: number; limit: number } => {
  let skip = 0;
  let limit = 10;
  if (isValidRange(range)) {
    [skip] = range;
    limit = range[1] - range[0];
    return { skip, limit };
  }

  if (isNaN(page)) {
    throw new Error('Page is not a number.');
  }
  const calculatedSkip = page * DEFAULT_RESPONSE_LIMIT;
  if (calculatedSkip < 0) {
    throw new Error('Page must be a positive number.');
  }
  return { skip: calculatedSkip, limit };
};

/* Packages the res response with sorting */
export const packageResponse = async ({
  res,
  docs,
  model,
  query,
}: {
  res: Response;
  docs: any[];
  model: Model<Document<any>>;
  query: Query<Document<any> | Document<any>[], Document<any>>;
  sort: { key: string; direction: boolean | 'asc' | 'desc' };
}): Promise<Response> => {
  // Not handling sorting to preserve alphabetical order
  const count = await model.countDocuments(query);
  res.setHeader('Content-Range', count);
  return res.send(docs);
};

/* Converts the filter query into a word to be used as the keyword query */
const parseFilter = (
  filter: string | { [key: string]: string } = '{"word": ""}',
  user: { [key: string]: string } = {},
): { [key: string]: string } => {
  try {
    const parsedFilter = typeof filter === 'object' ? filter : JSON.parse(filter) || { word: '' };
    if (parsedFilter.authorId) {
      parsedFilter.authorId = user.uid;
    }
    if (parsedFilter.userInteractions) {
      parsedFilter.userInteractions = user.uid;
    }
    if (parsedFilter.approvals) {
      parsedFilter.approvals = user.uid;
    }
    if (parsedFilter.denials) {
      parsedFilter.denials = user.uid;
    }
    return parsedFilter;
  } catch {
    throw new Error(`Invalid filter query syntax. Expected: {"word":"filter"}, Received: ${filter}`);
  }
};

/* Parses the ranges query to turn into an array */
const parseRange = (range: string | any): null | any => {
  try {
    if (!range) {
      return null;
    }
    const parsedRange = typeof range === 'object' ? range : JSON.parse(range) || null;
    return parsedRange;
  } catch {
    throw new Error(`Invalid range query syntax. Expected: [x,y], Received: ${range}`);
  }
};

/* Parses out the key and the direction of sorting out into an object */
const parseSortKeys = (sort: string): { key: string; direction: string } | null => {
  try {
    if (sort) {
      const parsedSort = JSON.parse(sort);
      const [key] =
        parsedSort[0] === 'approvals' || parsedSort[0] === 'denials' ? [`${parsedSort[0]}.length`] : parsedSort;
      const direction = parsedSort[1].toLowerCase();
      if (
        direction.toLowerCase() !== SortingDirections.ASCENDING &&
        direction.toLowerCase() !== SortingDirections.DESCENDING
      ) {
        throw new Error('Invalid sorting direction. Valid sorting optons: "asc" or "desc"');
      }
      return {
        key,
        direction,
      };
    }
    return null;
  } catch {
    throw new Error(`Invalid sort query syntax. Expected: [key,direction], Received: ${sort}`);
  }
};

/* Handles all the queries for searching in the database */
export const handleQueries = ({
  query = {},
  body = {},
  user = {},
  params,
  error,
  response,
  mongooseConnection,
}: Interfaces.EditorRequest): Interfaces.HandleQueries => {
  const {
    keyword = '',
    page: pageQuery = 0,
    range: rangeQuery = '',
    sort: sortQuery,
    filter: filterQuery,
    strict: strictQuery,
    uid: uidQuery,
    leaderboard,
    timeRange,
  } = query;
  const { word, example = '', ...filters } = parseFilter(filterQuery, user);
  const searchWord = removePrefix(keyword || word || '');
  const regexKeyword = constructRegexQuery({ user, searchWord, example });
  const page = parseInt(pageQuery, 10);
  const range = parseRange(rangeQuery);
  const { skip, limit } = convertToSkipAndLimit({ page, range });
  const sort = parseSortKeys(sortQuery);
  const strict = strictQuery === 'true';
  return {
    searchWord,
    regexKeyword,
    page,
    sort,
    skip,
    limit,
    filters,
    user,
    strict,
    body,
    uidQuery,
    leaderboard,
    referralCode: query['referral-code'],
    timeRange,
    error,
    params,
    response,
    mongooseConnection,
  };
};

/* Updates a document's merge property with a document id */
export const updateDocumentMerge = (
  suggestionDoc: Interfaces.WordSuggestion | Interfaces.ExampleSuggestion,
  originalDocId: string,
  mergedBy = null,
): Interfaces.WordSuggestion | Interfaces.ExampleSuggestion => {
  const updatedSuggestion = assign(suggestionDoc, { merged: originalDocId, mergedBy });
  return updatedSuggestion;
};
