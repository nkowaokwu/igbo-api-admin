import { has, omit } from 'lodash';
import { LOOK_BACK_DATE } from 'src/backend/shared/constants/emailDates';
import createRegExp from 'src/backend/shared/utils/createRegExp';
import SuggestionSource from 'src/backend/shared/constants/SuggestionSource';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import SentenceType from 'src/backend/shared/constants/SentenceType';
import Tense from 'src/backend/shared/constants/Tense';
import { SearchRegExp } from 'src/backend/controllers/utils/interfaces';

type ExampleSearchQuery = [
  { igbo: RegExp },
  { english: RegExp },
];

type Filters = {
  $expr?: any,
  $or?: any[],
  $and?: any[],
  attributes?: {
    isStandardIgbo?: { $eq: boolean },
  },
  source?: any,
  authorId?: any,
  mergedBy?: any,
  style?: any,
  type?: any,
  wordClass?: any,
  userInteractions?: any,
  approvals?: any,
  denials?: any,
  pronunciation?: any,
};

const generateSearchFilters = (filters: { [key: string]: string }, uid: string): { [key: string]: any } => {
  let searchFilters: Filters = filters ? Object.entries(filters).reduce((allFilters: Filters, [key, value]) => {
    allFilters.$or = allFilters.$or || [];
    switch (key) {
      case WordAttributes.IS_STANDARD_IGBO.value:
        allFilters[`attributes.${WordAttributes.IS_STANDARD_IGBO.value}`] = { $eq: !!value };
        break;
      case 'pronunciation':
        if (value) {
          allFilters.pronunciation = {
            $and: [
              { $exists: true, $type: 'string' },
              { $gt: [{ $strLenCP: '$pronunciation' }, 10] },
            ],
          };
        } else {
          allFilters.$or = [...allFilters.$or, { pronunciation: { $eq: null } }, { pronunciation: { $eq: '' } }];
        }
        break;
      case 'nsibidi':
        if (value) {
          allFilters.$and = [{ nsibidi: { $ne: null } }, { nsibidi: { $ne: '' } }];
        } else {
          allFilters.$or = [...allFilters.$or, { nsibidi: { $eq: null } }, { nsibidi: { $eq: '' } }];
        }
        break;
      case WordAttributes.IS_CONSTRUCTED_TERM.value:
        allFilters[`attributes.${WordAttributes.IS_CONSTRUCTED_TERM.value}`] = { $eq: !!value };
        break;
      case SuggestionSource.COMMUNITY:
        allFilters.source = { $eq: SuggestionSource.COMMUNITY };
        break;
      case SuggestionSource.INTERNAL:
        allFilters.$or = [
          ...allFilters.$or,
          { source: { $eq: SuggestionSource.INTERNAL } }, { source: { $exists: false } },
        ];
        break;
      case 'authorId':
        allFilters.authorId = { $eq: value };
        break;
      case 'mergedBy':
        allFilters.mergedBy = { $ne: null };
        break;
      case 'merger':
        allFilters.mergedBy = { $eq: uid };
        break;
      case 'example':
        allFilters.$or = [...allFilters.$or, { igbo: new RegExp(value) }, { english: new RegExp(value) }];
        break;
      case 'isProverb':
        allFilters.style = { $eq: ExampleStyle.PROVERB.value };
        break;
      case 'isDataCollection':
        allFilters.type = { $eq: SentenceType.DATA_COLLECTION };
        break;
      case 'wordClass':
        allFilters['definitions.wordClass'] = { $in: value };
        break;
      case 'userInteractions':
        allFilters.userInteractions = { $in: value };
        break;
      case 'approvals':
        allFilters.approvals = { $in: value };
        break;
      case 'denials':
        allFilters.denials = { $in: value };
        break;
      default:
        return allFilters;
    };
    return allFilters;
  }, {}) : {};
  if (has(searchFilters, '$or') && !searchFilters.$or.length) {
    searchFilters = omit(searchFilters, '$or');
  }
  return searchFilters;
};
const titleQuery = (regex: SearchRegExp): { title: { $regex: RegExp } } => ({ title: { $regex: regex.wordReg } });
const wordQuery = (regex: SearchRegExp): { word: { $regex: RegExp } } => ({ word: { $regex: regex.wordReg } });
const fullTextSearchQuery = (
  keyword: string,
  regex: SearchRegExp,
): { word?: { $regex: RegExp }, $or?: any } => (
  !keyword
    ? { word: { $regex: /./ } }
    : ({
      $or: [
        { word: keyword },
        { word: { $regex: regex.wordReg } },
        { 'definitions.definitions': { $in: [regex.definitionsReg] } },
        { variations: keyword },
        { nsibidi: keyword },
        { [`dialects.${keyword}`]: { $exists: true } },
        ...Object.values(Tense).reduce((finalIndexes, tense) => ([
          ...finalIndexes,
          { [`tenses.${tense.value}`]: keyword },
        ]), []),
      ],
    })
);
const bodyQuery = (regex: SearchRegExp): { body: { $regex: RegExp } } => ({ body: { $regex: regex.wordReg } });
const variationsQuery = (regex: SearchRegExp): { variations: { $in: [RegExp] } } => (
  { variations: { $in: [regex.wordReg] } }
);
const hostsQuery = (host: string): { hosts: { $in: [string] } } => ({ hosts: { $in: [host] } });

/* Regex match query used to later to defined the Content-Range response header */
export const searchExamplesRegexQuery = (
  uid: string,
  regex: SearchRegExp,
  filters: { [key: string]: string },
): { $or: ExampleSearchQuery, archived: { [key: string]: boolean } } => (
  {
    $or: [{ igbo: regex.wordReg }, { english: regex.definitionsReg }],
    archived: { $ne: true },
    ...(filters ? generateSearchFilters(filters, uid) : {}),
  }
);
export const searchExampleSuggestionsRegexQuery = (
  uid: string,
  regex: SearchRegExp,
  filters: { [key: string]: string },
): {
  $or: ExampleSearchQuery,
  exampleForSuggestion: boolean,
  merged: null,
} => ({
  $or: [{ igbo: regex.wordReg }, { english: regex.definitionsReg }],
  exampleForSuggestion: false,
  merged: null,
  ...(filters ? generateSearchFilters(filters, uid) : {}),
});
export const searchRandomExampleSuggestionsRegexQuery = (uid: string) : {
  igbo: { $exists: boolean, $type: string },
  $expr: { $gt: ({ $strLenCP: string } | number)[] },
  pronunciation: string,
  exampleForSuggestion: { $ne: boolean },
  merged: null,
  userInteractions: { $nin: [string] },
} => ({
  igbo: { $exists: true, $type: 'string' },
  $expr: { $gt: [{ $strLenCP: '$igbo' }, 10] },
  pronunciation: '',
  exampleForSuggestion: { $ne: true },
  merged: null,
  userInteractions: { $nin: [uid] },
});
export const searchRandomExampleSuggestionsToReviewRegexQuery = () : {
  [key: string]: { $exists: boolean },
} => ({
  'approvals.1': { $exists: false },
  'denials.1': { $exists: false },
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
  uid: string,
  regex: SearchRegExp,
  filters?: { [key: string]: string },
): {
    $or: (
    { word: { $regex: RegExp } } | { variations: { $in: [RegExp] } }
    )[],
    merged: null,
    updatedAt?: any,
  } => ({
  $or: [wordQuery(regex), variationsQuery(regex)],
  merged: null,
  ...(filters ? generateSearchFilters(filters, uid) : {}),
});
export const searchPreExistingCorpusSuggestionsRegexQuery = (
  uid: string,
  regex: SearchRegExp,
  filters?: { [key: string]: string },
): {
    $or: (
    { title: { $regex: RegExp } } |
    { body: { $regex: RegExp } }
    )[],
    merged: null,
  } => ({
  $or: [titleQuery(regex), bodyQuery(regex)],
  merged: null,
  ...(filters ? generateSearchFilters(filters, uid) : {}),
});
export const searchCorpusTextSearch = (
  keyword: string,
  regex: SearchRegExp,
): { [key: string]: any } => ({
  $or: [
    { title: keyword },
    { title: { $regex: regex.wordReg } },
    { body: keyword },
    { body: { $regex: regex.definitionsReg } },
  ],
});
export const searchIgboTextSearch = (
  uid: string,
  keyword: string,
  regex: SearchRegExp,
  filters?: { [key: string]: string },
): { [key: string]: any } => ({
  ...fullTextSearchQuery(keyword, regex),
  ...(filters ? generateSearchFilters(filters, uid) : {}),
});
/* Since the word field is not non-accented yet,
 * a strict regex search for words has to be used as a workaround */
export const strictSearchIgboQuery = (word: string): { word: RegExp } => ({
  word: createRegExp(word, true).wordReg,
});
export const searchForLastWeekQuery = (): {
  updatedAt: { [key: string]: number },
  merged: { [key: string]: null },
} => ({
  updatedAt: { $gte: LOOK_BACK_DATE.valueOf() },
  merged: { $ne: null },
});
export const searchDeveloperWithHostsQuery = hostsQuery;
export const searchForAllWordsWithAudioPronunciations = (): { pronunciation: any, $expr: any } => ({
  pronunciation: { $exists: true, $type: 'string' },
  $expr: { $gt: [{ $strLenCP: '$pronunciation' }, 10] },
});
export const searchForAllWordsWithIsStandardIgbo = (): { attributes: { isStandardIgbo: boolean } } => ({
  // @ts-ignore
  'attributes.isStandardIgbo': true,
});
export const searchForAllWordsWithNsibidi = (): { $and: any } => ({
  $and: [{ 'definitions.nsibidi': { $ne: null } }, { 'definitions.nsibidi': { $ne: '' } }],
});
export const searchForAssociatedWordSuggestions = (wordId: string): {
  originalWordId: string,
  merged: { [key: string]: null }
} => ({
  originalWordId: wordId,
  merged: { $eq: null },
});
export const searchForAssociatedExampleSuggestions = (wordId: string): {
  originalExampleId: string,
  merged: { [key: string]: null }
} => ({
  originalExampleId: wordId,
  merged: { $eq: null },
});
export const searchForAssociatedSuggestionsByTwitterId = (twitterPollId: string): {
  twitterPollId: string,
  merged: { [key: string]: null }
} => ({
  twitterPollId,
  merged: { $eq: null },
});
