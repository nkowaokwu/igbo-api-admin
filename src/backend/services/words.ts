/* eslint-disable import/extensions */
import { reduce, keys } from 'lodash';
import databaseDictionary from 'src/tests/__mocks__/genericWords_mock';
import removePrefix from '../shared/utils/removePrefix';

// import databaseDictionary from '../dictionaries/ig-en/ig-en_expanded.json';

const doesVariationMatch = (termInformation, regexWord) => (
  reduce(termInformation, (status, information) => {
    if (status) {
      return status;
    }
    return information.variations.some((variation) => variation.match(regexWord));
  }, false)
);

/* Provided a dictionary, find the corresponding terms */
export const resultsFromDictionarySearch = (
  searchRegex: RegExp,
  dictionary: { [key: string]: any },
) => (
  keys(dictionary).reduce((matchedResults, key) => {
    const currentMatchedResults = { ...matchedResults };
    const termInformation = dictionary[key];
    const trimmedKey = removePrefix(key);
    const isTrimmedKeyAndWordSameLength = trimmedKey.match(searchRegex);
    if (isTrimmedKeyAndWordSameLength || doesVariationMatch(termInformation, searchRegex)) {
      currentMatchedResults[key] = termInformation;
    }
    return currentMatchedResults;
  }, {})
);

// @ts-ignore
export const findSearchWord = (...args) => resultsFromDictionarySearch(...args, databaseDictionary);
