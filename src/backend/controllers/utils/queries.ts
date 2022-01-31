import { LOOK_BACK_DATE } from '../../shared/constants/emailDates';
import createRegExp from '../../shared/utils/createRegExp';

interface ExampleSearchQuery {
  $or: [
    { igbo: RegExp },
    { english: RegExp },
  ],
}

const generateSearchFilters = (filters: { [key: string]: string }): { [key: string]: string } => {
  const searchFilters = filters ? Object.entries(filters).reduce((allFilters, [key, value]) => {
    switch (key) {
      case 'isStandardIgbo':
        allFilters.isStandardIgbo = { $eq: !!value };
        break;
      case 'pronunciation':
        if (value) {
          allFilters.$expr = { $gt: [{ $strLenCP: '$pronunciation' }, 10] };
        } else {
          allFilters.$or = [{ pronunciation: { $eq: null } }, { pronunciation: { $eq: '' } }];
        }
        break;
      case 'authorId':
        allFilters.authorId = { $eq: value };
        break;
      default:
        return allFilters;
    };
    return allFilters;
  }, {}) : {};
  return searchFilters;
};

const wordQuery = (regex: RegExp): { word: { $regex: RegExp } } => ({ word: { $regex: regex } });
const fullTextSearchQuery = (
  keyword: string,
): { word?: { $regex: RegExp }, $text?: { $search: string } } => (
  !keyword
    ? { word: { $regex: /./ } }
    : { $text: { $search: keyword } }
);
const variationsQuery = (regex: RegExp): { variations: { $in: [RegExp] } } => ({ variations: { $in: [regex] } });
const definitionsQuery = (regex: RegExp): { definitions: { $in: [RegExp] } } => ({ definitions: { $in: [regex] } });
const hostsQuery = (host: string): { hosts: { $in: [string] } } => ({ hosts: { $in: [host] } });

/* Regex match query used to later to defined the Content-Range response header */
export const searchExamplesRegexQuery = (regex: RegExp): ExampleSearchQuery => (
  ({ $or: [{ igbo: regex }, { english: regex }] })
);
export const searchExampleSuggestionsRegexQuery = (
  regex: RegExp,
  filters: { [key: string]: string },
): {
  $or: ExampleSearchQuery,
  exampleForSuggestion: boolean,
  merged: null,
} => ({
  $or: [{ igbo: regex }, { english: regex }],
  exampleForSuggestion: false,
  merged: null,
  ...(filters ? generateSearchFilters(filters) : {}),
});
export const searchPreExistingExampleSuggestionsRegexQuery = (
  { igbo, english, associatedWordId }: { igbo: string, english: string, associatedWordId: string },
): any => ({
  igbo,
  english,
  associatedWords: associatedWordId,
  originalExampleId: null,
  merged: null,
});
export const searchPreExistingWordSuggestionsRegexQuery = (
  regex: RegExp,
  filters?: { [key: string]: string },
): {
    $or: (
    { word: { $regex: RegExp } } | { variations: { $in: [RegExp] } }
    )[],
    merged: null,
  } => ({
  $or: [wordQuery(regex), variationsQuery(regex)],
  merged: null,
  ...(filters ? generateSearchFilters(filters) : {}),
});
export const searchPreExistingGenericWordsRegexQueryAsEditor = (
  segmentRegex: RegExp,
  regex: RegExp,
): { $or: { $and: any[] }[], merged: null } => ({
  $or: [
    { $and: [wordQuery(regex), { word: { $regex: segmentRegex } }] },
    { $and: [variationsQuery(regex), { variations: { $regex: segmentRegex } }] },
    { $and: [definitionsQuery(regex), { word: { $regex: segmentRegex } }] },
  ],
  merged: null,
});
export const searchPreExistingGenericWordsRegexQuery = (regex: RegExp): { $or: any[], merged: null } => ({
  $or: [wordQuery(regex), variationsQuery(regex), definitionsQuery(regex)],
  merged: null,
});
export const searchIgboTextSearch = (
  keyword: string,
  filters?: { [key: string]: string },
): { [key: string]: any } => ({
  ...fullTextSearchQuery(keyword),
  ...(filters ? generateSearchFilters(filters) : {}),
});
/* Since the word field is not non-accented yet,
 * a strict regex search for words has to be used as a workaround */
export const strictSearchIgboQuery = (word: string): { word: RegExp } => ({
  word: createRegExp(word, true),
});
export const searchEnglishRegexQuery = (
  keyword: RegExp,
  filters?: { [key: string]: string },
): { [key: string]: any } => ({
  ...definitionsQuery(keyword),
  ...(filters ? generateSearchFilters(filters) : {}),
});
export const searchForLastWeekQuery = (): {
  updatedOn: { [key: string]: number },
  merged: { [key: string]: null },
} => ({
  updatedOn: { $gte: LOOK_BACK_DATE.valueOf() },
  merged: { $ne: null },
});
export const searchDeveloperWithHostsQuery = hostsQuery;
export const searchForAllWordsWithAudioPronunciations = (): { pronunciation: any, $expr: any } => ({
  pronunciation: { $exists: true },
  $expr: { $gt: [{ $strLenCP: '$pronunciation' }, 10] },
});
export const searchForAllWordsWithIsStandardIgbo = (): { isStandardIgbo: boolean } => ({
  isStandardIgbo: true,
});
export const searchForAllWordsWithNsibidi = (): { nsibidi: { $ne: string } } => ({
  nsibidi: { $ne: '' },
});
export const searchForAssociatedSuggestions = (wordId: string): {
  originalWordId: string,
  merged: { [key: string]: null }
} => ({
  originalWordId: wordId,
  merged: { $eq: null },
});
