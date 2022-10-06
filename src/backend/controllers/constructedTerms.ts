import { Response, NextFunction } from 'express';
import { map } from 'lodash';
import * as Interfaces from './utils/interfaces';
import WordSuggestion from '../models/WordSuggestion';
import { placeExampleSuggestionsOnSuggestionDoc } from './utils/nestedExampleSuggestionUtils';
import { createWordSuggestionDocument, findWordSuggestions } from './wordSuggestions';
import { handleQueries, packageResponse } from './utils';
import { searchPreExistingWordSuggestionsRegexQuery } from './utils/queries';

// Get only constructedTerms from the dictionary
export const getConstructedTerms = (
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
    filters.isConstructedTerm = true;
    const regexMatch = searchPreExistingWordSuggestionsRegexQuery(regexKeyword, filters);
    return findWordSuggestions({ regexMatch, skip, limit })
      .then(async (wordSuggestions: [Interfaces.WordSuggestion]) => {
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

export const postConstructedTerm = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { body: data, user } = req;
    const savedConstructedTerm = await createWordSuggestionDocument(data, user);
    return res.send(savedConstructedTerm);
  } catch (err) {
    return next(err);
  }
};
