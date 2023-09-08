import { has, omit } from 'lodash';
import moment from 'moment';
import { LOOK_BACK_DATE } from 'src/backend/shared/constants/emailDates';
import createRegExp from 'src/backend/shared/utils/createRegExp';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import Tense from 'src/backend/shared/constants/Tense';
import { SearchRegExp } from 'src/backend/controllers/utils/interfaces';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';

const EXAMPLE_PRONUNCIATION_LIMIT = 2;
type ExampleSearchQuery = [{ igbo: RegExp }, { english: RegExp }];

type Filters = {
  $expr?: any;
  $or?: any[];
  $and?: any[];
  attributes?: {
    isStandardIgbo?: { $eq: boolean };
  };
  source?: any;
  authorId?: any;
  mergedBy?: any;
  style?: any;
  type?: any;
  wordClass?: any;
  userInteractions?: any;
  approvals?: any;
  denials?: any;
  pronunciation?: any;
  merged?: boolean;
};

const generateSearchFilters = (filters: { [key: string]: string }, uid: string): { [key: string]: any } => {
  let searchFilters: Filters = filters
    ? Object.entries(filters).reduce((allFilters: Filters, [key, value]) => {
        allFilters.$or = allFilters.$or || [];
        switch (key) {
          case WordAttributeEnum.IS_STANDARD_IGBO:
            allFilters[`attributes.${WordAttributeEnum.IS_STANDARD_IGBO}`] = { $eq: !!value };
            break;
          case 'pronunciation':
            if (value) {
              allFilters.$or = [
                ...allFilters.$or,
                { pronunciation: { $exists: true, $type: 'string', $ne: '' } },
                { 'pronunciations.0.audio': { $exists: true, $type: 'string', $ne: '' } },
              ];
            } else {
              allFilters.$or = [
                ...allFilters.$or,
                { pronunciation: { $eq: null } },
                { pronunciation: { $eq: '' } },
                { 'pronunciations.0.audio': { $eq: null } },
                { 'pronunciations.0.audio': { $eq: '' } },
              ];
            }
            break;
          case 'nsibidi':
            if (value) {
              allFilters.$and = [{ 'definitions.nsibidi': { $ne: null } }, { 'definitions.nsibidi': { $ne: '' } }];
            } else {
              allFilters.$or = [
                ...allFilters.$or,
                { 'definitions.nsibidi': { $eq: null } },
                { 'definitions.nsibidi': { $eq: '' } },
              ];
            }
            break;
          case WordAttributeEnum.IS_CONSTRUCTED_TERM:
            allFilters[`attributes.${WordAttributeEnum.IS_CONSTRUCTED_TERM}`] = { $eq: !!value };
            break;
          case SuggestionSourceEnum.COMMUNITY:
            allFilters.$or = [
              ...allFilters.$or,
              { source: { $eq: SuggestionSourceEnum.COMMUNITY } },
              { source: { $exists: false } },
            ];
            break;
          case SuggestionSourceEnum.INTERNAL:
            allFilters.$or = [
              ...allFilters.$or,
              { source: { $eq: SuggestionSourceEnum.INTERNAL } },
              { source: { $exists: false } },
            ];
            break;
          case SuggestionSourceEnum.IGBO_SPEECH:
            allFilters.$or = [
              ...allFilters.$or,
              { source: { $eq: SuggestionSourceEnum.IGBO_SPEECH } },
              { source: { $exists: false } },
            ];
            break;
          case SuggestionSourceEnum.IGBO_WIKIMEDIANS:
            allFilters.$or = [
              ...allFilters.$or,
              { source: { $eq: SuggestionSourceEnum.IGBO_WIKIMEDIANS } },
              { source: { $exists: false } },
            ];
            break;
          case SuggestionSourceEnum.BBC:
            allFilters.$or = [
              ...allFilters.$or,
              { source: { $eq: SuggestionSourceEnum.BBC } },
              { source: { $exists: false } },
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
          case ExampleStyleEnum.PROVERB:
            allFilters.style = { $eq: ExampleStyle[ExampleStyleEnum.PROVERB].value };
            break;
          case SentenceTypeEnum.DATA_COLLECTION:
            allFilters.type = { $eq: SentenceTypeEnum.DATA_COLLECTION };
            break;
          case SentenceTypeEnum.BIBLICAL:
            allFilters.type = { $eq: SentenceTypeEnum.BIBLICAL };
            break;
          case 'wordClass':
            allFilters['definitions.wordClass'] = { $in: value };
            break;
          case 'userInteractions':
            allFilters.userInteractions = { $in: value };
            delete allFilters.merged;
            break;
          case 'approvals':
            allFilters.approvals = { $in: value };
            break;
          case 'denials':
            allFilters.denials = { $in: value };
            break;
          default:
            return allFilters;
        }
        return allFilters;
      }, {})
    : {};
  if (has(searchFilters, '$or') && !searchFilters.$or.length) {
    searchFilters = omit(searchFilters, '$or');
  }
  return searchFilters;
};
const titleQuery = (regex: SearchRegExp): { title: { $regex: RegExp } } => ({ title: { $regex: regex.wordReg } });
const wordQuery = (regex: SearchRegExp): { word: { $regex: RegExp } } => ({ word: { $regex: regex.wordReg } });
const fullTextSearchQuery = (keyword: string, regex: SearchRegExp): { word?: { $regex: RegExp }; $or?: any } =>
  !keyword
    ? { word: { $regex: /./ } }
    : {
        $or: [
          { word: keyword },
          { word: { $regex: regex.wordReg } },
          { 'definitions.definitions': { $in: [regex.definitionsReg] } },
          { variations: keyword },
          { nsibidi: keyword },
          { [`dialects.${keyword}`]: { $exists: true } },
          ...Object.values(Tense).reduce(
            (finalIndexes, tense) => [...finalIndexes, { [`tenses.${tense.value}`]: keyword }],
            [],
          ),
        ],
      };
const bodyQuery = (regex: SearchRegExp): { body: { $regex: RegExp } } => ({ body: { $regex: regex.wordReg } });
const variationsQuery = (regex: SearchRegExp): { variations: { $in: [RegExp] } } => ({
  variations: { $in: [regex.wordReg] },
});
const hostsQuery = (host: string): { hosts: { $in: [string] } } => ({ hosts: { $in: [host] } });

/* Regex match query used to later to defined the Content-Range response header */
export const searchExamplesRegexQuery = (
  uid: string,
  regex: SearchRegExp,
  filters: { [key: string]: string },
): { $or: ExampleSearchQuery; archived: { [key: string]: boolean } } => ({
  $or: [{ igbo: regex.wordReg }, { english: regex.definitionsReg }],
  archived: { $ne: true },
  ...(filters ? generateSearchFilters(filters, uid) : {}),
});

export const searchExampleSuggestionsRegexQuery = (
  uid: string,
  regex: SearchRegExp,
  filters: { [key: string]: string },
): {
  $or: ExampleSearchQuery;
  exampleForSuggestion: boolean;
  merged: null;
} => ({
  $or: [{ igbo: regex.wordReg }, { english: regex.definitionsReg }],
  exampleForSuggestion: false,
  merged: null,
  ...(filters ? generateSearchFilters(filters, uid) : {}),
});

/**
 * CROWDSOURCING
 */

/**
 * Returns Example documents that don't have up to the limit of audio recordings
 * @param uid
 * @returns
 */
export const searchExamplesWithoutEnoughAudioRegexQuery = (
  uid: string,
): {
  igbo: { $exists: boolean; $type: string };
  $expr: { $gt: ({ $strLenCP: string } | number)[] };
  // @ts-expect-error
  [`pronunciations.${EXAMPLE_PRONUNCIATION_LIMIT}.audio`]: { $exists: false };
  $and: { [key: string]: { $nin: [string] } }[];
} => ({
  igbo: { $exists: true, $type: 'string' },
  $expr: { $gt: [{ $strLenCP: '$igbo' }, 6] },
  [`pronunciations.${EXAMPLE_PRONUNCIATION_LIMIT}.audio`]: { $exists: false },
  $and: [{ 'pronunciations.speaker': { $nin: [uid] } }, { userInteractions: { $nin: [uid] } }],
});

/**
 * Returns ExampleSuggestion documents that don't have up to the limit of audio recordings
 * and is not a nested ExampleSuggestion
 * @param uid
 * @returns
 */
export const searchRandomExampleSuggestionsToRecordRegexQuery = (
  uid: string,
): {
  exampleForSuggestion: { $ne: true };
  igbo: { $exists: boolean; $type: string };
  $expr: { $gt: ({ $strLenCP: string } | number)[] };
  // @ts-expect-error
  [`pronunciations.${EXAMPLE_PRONUNCIATION_LIMIT}.audio`]: { $exists: false };
  merged: null;
  $and: { [key: string]: { $nin: [string] } }[];
} => ({
  exampleForSuggestion: { $ne: true },
  igbo: { $exists: true, $type: 'string' },
  $expr: { $gt: [{ $strLenCP: '$igbo' }, 6] },
  [`pronunciations.${EXAMPLE_PRONUNCIATION_LIMIT}.audio`]: { $exists: false },
  merged: null,
  $and: [{ 'pronunciations.speaker': { $nin: [uid] } }, { userInteractions: { $nin: [uid] } }],
});

/**
 * Returns ExampleSuggestion documents that are marked for review
 * @param uid
 * @returns
 */
export const searchRandomExampleSuggestionsToReviewRegexQuery = (
  uid: string,
): {
  merged: null;
  exampleForSuggestion: { $ne: true };
  'pronunciations.0.audio': { $exists: boolean; $type: string; $ne: string };
  pronunciations: { $elemMatch: { $and: { [key: string]: { $nin: [string] } }[] } };
} => ({
  merged: null,
  exampleForSuggestion: { $ne: true },
  'pronunciations.0.audio': { $exists: true, $type: 'string', $ne: '' },
  // Returns an example where the user hasn't approved or denied an audio pronunciation
  pronunciations: {
    $elemMatch: {
      $and: [{ approvals: { $nin: [uid] } }, { denials: { $nin: [uid] } }],
    },
  },
});

/**
 * Returns ExampleSuggestion documents that are marked for review
 * @param uid
 * @returns
 */
export const searchRandomExampleSuggestionsToTranslateRegexQuery = (
  uid: string,
): {
  merged: null;
  english: string;
  exampleForSuggestion: { $ne: true };
  'pronunciations.0.audio': { $exists: boolean; $type: string; $ne: string };
  pronunciations: { $elemMatch: { $and: { [key: string]: { $nin: [string] } }[] } };
} => ({
  merged: null,
  english: '',
  exampleForSuggestion: { $ne: true },
  'pronunciations.0.audio': { $exists: true, $type: 'string', $ne: '' },
  // Returns an example where the user hasn't approved or denied an audio pronunciation
  pronunciations: {
    $elemMatch: {
      $and: [{ approvals: { $nin: [uid] } }, { denials: { $nin: [uid] } }],
    },
  },
});
export const searchPreExistingExampleSuggestionsRegexQuery = ({
  igbo,
}: {
  igbo: string;
}): { igbo: string; merged: null } => ({
  igbo,
  merged: null,
});
export const searchPreExistingWordSuggestionsRegexQuery = (
  uid: string,
  regex: SearchRegExp,
  filters?: { [key: string]: string },
): {
  $or: ({ word: { $regex: RegExp } } | { variations: { $in: [RegExp] } })[];
  merged: null;
  updatedAt?: any;
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
  $or: ({ title: { $regex: RegExp } } | { body: { $regex: RegExp } })[];
  merged: null;
} => ({
  $or: [titleQuery(regex), bodyQuery(regex)],
  merged: null,
  ...(filters ? generateSearchFilters(filters, uid) : {}),
});
export const searchCorpusTextSearch = (keyword: string, regex: SearchRegExp): { [key: string]: any } => ({
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
  updatedAt: { [key: string]: number };
  merged: { [key: string]: null };
} => ({
  updatedAt: { $gte: LOOK_BACK_DATE.valueOf() },
  merged: { $ne: null },
});
export const searchDeveloperWithHostsQuery = hostsQuery;
export const searchForAllWordsWithAudioPronunciations = (): { pronunciation: any; $expr: any } => ({
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
export const searchForAssociatedWordSuggestions = (
  wordId: string,
): {
  originalWordId: string;
  merged: { [key: string]: null };
} => ({
  originalWordId: wordId,
  merged: { $eq: null },
});
export const searchForAssociatedExampleSuggestions = (
  wordId: string,
): {
  originalExampleId: string;
  merged: { [key: string]: null };
} => ({
  originalExampleId: wordId,
  merged: { $eq: null },
});
export const searchForAssociatedSuggestionsByTwitterId = (
  twitterPollId: string,
): {
  twitterPollId: string;
  merged: { [key: string]: null };
} => ({
  twitterPollId,
  merged: { $eq: null },
});
export const searchWordsWithoutIgboDefinitions = (): {
  [key: string]: { $exists: boolean };
} => ({
  'definitions.0.igboDefinitions.0': { $exists: false },
});
export const searchWordSuggestionsWithoutIgboDefinitionsFromLastMonth = (): {
  [key: string]: { $exists: boolean } | { $gte: number } | { $ne: string } | null;
} => ({
  'definitions.0.igboDefinitions.0': { $exists: false },
  source: { $ne: SuggestionSourceEnum.COMMUNITY },
  updatedAt: { $gte: moment().subtract(1, 'months').startOf('month').valueOf() },
  merged: null,
});

/**
 * Gets example suggestions where the user's audio has been approved
 */
export const searchApprovedExampleSuggestionAudioPronunciations = (
  uid: string,
): {
  pronunciations: {
    $elemMatch: {
      $and: { [key: string]: string | { $exists: true } }[];
    };
  };
} => ({
  pronunciations: {
    $elemMatch: {
      $and: [{ speaker: uid }, { 'approvals.1': { $exists: true } }],
    },
  },
});
/**
 * Gets example suggestions where the user's audio has been denied
 */
export const searchDeniedExampleSuggestionAudioPronunciations = (
  uid: string,
): {
  pronunciations: {
    $elemMatch: {
      $and: { [key: string]: string | { $exists: true } }[];
    };
  };
} => ({
  pronunciations: {
    $elemMatch: {
      $and: [{ speaker: uid }, { 'denials.0': { $exists: true } }],
    },
  },
});
