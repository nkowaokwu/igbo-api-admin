import { Response, NextFunction } from 'express';
import Word from 'src/backend/models/Word';
import {
  packageResponse,
  handleQueries,
} from './utils';
import {
  searchIgboTextSearch,
  strictSearchIgboQuery,
  searchEnglishRegexQuery,
} from './utils/queries';
import { searchWordUsingIgbo, searchWordUsingEnglish } from './words';
import * as Interfaces from './utils/interfaces';

/* Gets constructed words from MongoDB */
export const getConstructedTerms = async (
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
      ...rest
    } = handleQueries(req);
    const searchQueries = {
      searchWord,
      skip,
      limit,
      dialects,
      examples: true,
      attributes: { isConstructed: true },
    };
    let query: {
      word?: any,
      text?: any
      definitions?: any
    } = !strict ? searchIgboTextSearch(searchWord, regexKeyword, filters) : strictSearchIgboQuery(searchWord);
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
