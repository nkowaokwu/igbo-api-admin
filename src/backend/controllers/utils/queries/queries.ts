import { has, omit } from 'lodash';
import moment from 'moment';
import { Types } from 'mongoose';
import createRegExp from 'src/backend/shared/utils/createRegExp';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import Tense from 'src/backend/shared/constants/Tense';
import { SearchRegExp } from 'src/backend/controllers/utils/interfaces';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';

const EXAMPLE_PRONUNCIATION_LIMIT = 3;
type ExampleSearchQuery = [{ igbo: RegExp }, { english: RegExp }];

type Filters = {
  $expr?: any;
  $or?: any[];
  $and?: any[];
  attributes?: {
    isStandardIgbo?: { $eq: boolean };
  };
  origin?: any;
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

export const generateSearchFilters = (filters: { [key: string]: string }, uid: string): { [key: string]: any } => {
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
              { origin: { $eq: SuggestionSourceEnum.COMMUNITY } },
              { origin: { $exists: false } },
            ];
            break;
          case SuggestionSourceEnum.INTERNAL:
            allFilters.$or = [
              ...allFilters.$or,
              { origin: { $eq: SuggestionSourceEnum.INTERNAL } },
              { origin: { $exists: false } },
            ];
            break;
          case SuggestionSourceEnum.IGBO_SPEECH:
            allFilters.$or = [
              ...allFilters.$or,
              { origin: { $eq: SuggestionSourceEnum.IGBO_SPEECH } },
              { origin: { $exists: false } },
            ];
            break;
          case SuggestionSourceEnum.IGBO_WIKIMEDIANS:
            allFilters.$or = [
              ...allFilters.$or,
              { origin: { $eq: SuggestionSourceEnum.IGBO_WIKIMEDIANS } },
              { origin: { $exists: false } },
            ];
            break;
          case SuggestionSourceEnum.BBC:
            allFilters.$or = [
              ...allFilters.$or,
              { origin: { $eq: SuggestionSourceEnum.BBC } },
              { origin: { $exists: false } },
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
            allFilters.$or = [
              ...allFilters.$or,
              { 'source.text': new RegExp(value) },
              { 'translations.0.text': new RegExp(value) },
            ];
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
export const titleQuery = (regex: SearchRegExp): { title: { $regex: RegExp } } => ({
  title: { $regex: regex.wordReg },
});
export const wordQuery = (regex: SearchRegExp): { word: { $regex: RegExp } } => ({ word: { $regex: regex.wordReg } });
export const fullTextSearchQuery = (keyword: string, regex: SearchRegExp): { word?: { $regex: RegExp }; $or?: any } =>
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
export const bodyQuery = (regex: SearchRegExp): { body: { $regex: RegExp } } => ({ body: { $regex: regex.wordReg } });
export const variationsQuery = (regex: SearchRegExp): { variations: { $in: [RegExp] } } => ({
  variations: { $in: [regex.wordReg] },
});
const hostsQuery = (host: string): { hosts: { $in: [string] } } => ({ hosts: { $in: [host] } });

/* Regex match query used to later to defined the Content-Range response header */
export const searchExamplesRegexQuery = (
  uid: string,
  regex: SearchRegExp,
  filters: { [key: string]: string },
  projectId: string,
): { $or: ExampleSearchQuery; archived: { [key: string]: boolean } } => ({
  $or: [{ source: { text: regex.wordReg } }, { 'translations.text': regex.definitionsReg }],
  archived: { $ne: true },
  projectId: { $eq: projectId },
  ...(filters ? generateSearchFilters(filters, uid) : {}),
});

export const searchExampleSuggestionsRegexQuery = (
  uid: string,
  regex: SearchRegExp,
  projectId: string,
  filters: { [key: string]: string },
): {
  $or: ExampleSearchQuery;
  exampleForSuggestion: boolean;
  projectId: { $eq: string };
  merged: null;
} => ({
  $or: [{ source: { text: regex.wordReg } }, { 'translations.text': regex.definitionsReg }],
  exampleForSuggestion: false,
  merged: null,
  projectId: { $eq: projectId },
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
  projectId: string,
): {
  merged: null;
  exampleForSuggestion: { $ne: true };
  igbo: { $exists: boolean; $type: string };
  $expr: { $gt: ({ $strLenCP: string } | number)[] };
  type: SentenceTypeEnum.DATA_COLLECTION;
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH };
  updatedAt: { $gte: Date };
  // @ts-expect-error
  [`pronunciations.${EXAMPLE_PRONUNCIATION_LIMIT}.audio`]: { $exists: false };
  'pronunciations.speaker': { $nin: [string] };
  projectId: { $eq: string };
} => ({
  merged: null,
  exampleForSuggestion: { $ne: true },
  igbo: { $exists: true, $type: 'string' },
  $expr: { $gt: [{ $strLenCP: '$igbo' }, 6] },
  type: SentenceTypeEnum.DATA_COLLECTION,
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH },
  [`pronunciations.${EXAMPLE_PRONUNCIATION_LIMIT}.audio`]: { $exists: false },
  updatedAt: { $gte: moment('2023-01-01').toDate() },
  // Returns an example where the user hasn't approved or denied an audio pronunciation
  'pronunciations.speaker': { $nin: [uid] },
  projectId: { $eq: projectId },
});

/**
 * Returns ExampleSuggestion documents that are marked for review
 * @param uid
 * @returns
 */
export const searchRandomExampleSuggestionsToReviewRegexQuery = ({
  uid,
  projectId,
}: {
  uid: string;
  projectId: string;
}): {
  merged: null;
  exampleForSuggestion: { $ne: true };
  'pronunciations.review': true;
  type: SentenceTypeEnum.DATA_COLLECTION;
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH };
  updatedAt: { $gte: Date };
  'pronunciations.speaker': { $nin: [string] };
  pronunciations: { $elemMatch: { $and: { [key: string]: { $nin: [string] } }[] } };
  projectId: { $eq: string };
} => ({
  merged: null,
  exampleForSuggestion: { $ne: true },
  'pronunciations.review': true,
  type: SentenceTypeEnum.DATA_COLLECTION,
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH },

  // Only looks at the data collection sentences uploaded starting from 2023
  updatedAt: { $gte: moment('2023-01-01').toDate() },
  'pronunciations.speaker': { $nin: [uid] },
  // Returns an example where the user hasn't approved or denied an audio pronunciation
  pronunciations: {
    $elemMatch: {
      $and: [{ approvals: { $nin: [uid] } }, { denials: { $nin: [uid] } }],
    },
  },
  projectId: { $eq: projectId },
});

/**
 * Returns ExampleSuggestion documents that are marked for review
 * @param uid
 * @returns
 */
export const searchRandomExampleSuggestionsToTranslateRegexQuery = (
  uid: string,
  projectId: string,
): {
  merged: null;
  translations: { $elemMatch: { text: string } };
  exampleForSuggestion: { $ne: true };
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH };
  'pronunciations.0.audio': { $exists: boolean; $type: string; $ne: string };
  pronunciations: { $elemMatch: { $and: { [key: string]: { $nin: [string] } }[] } };
  projectId: { $eq: string };
} => ({
  merged: null,
  translations: {
    $elemMatch: { text: '' },
  },
  exampleForSuggestion: { $ne: true },
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH },
  'pronunciations.0.audio': { $exists: true, $type: 'string', $ne: '' },
  // Returns an example where the user hasn't approved or denied an audio pronunciation
  pronunciations: {
    $elemMatch: {
      $and: [{ approvals: { $nin: [uid] } }, { denials: { $nin: [uid] } }],
    },
  },
  projectId: { $eq: projectId },
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
  projectId: string,
  filters?: { [key: string]: string },
): {
  $or: ({ word: { $regex: RegExp } } | { variations: { $in: [RegExp] } })[];
  merged: null;
  projectId: { $eq: string };
  updatedAt?: any;
} => ({
  $or: [wordQuery(regex), variationsQuery(regex)],
  merged: null,
  projectId: { $eq: projectId },
  ...(filters ? generateSearchFilters(filters, uid) : {}),
});
export const searchPreExistingCorpusSuggestionsRegexQuery = (
  uid: string,
  regex: SearchRegExp,
  projectId: string,
  filters?: { [key: string]: string },
): {
  $or: ({ title: { $regex: RegExp } } | { body: { $regex: RegExp } })[];
  projectId: { $eq: string };
  merged: null;
} => ({
  $or: [titleQuery(regex), bodyQuery(regex)],
  merged: null,
  projectId: { $eq: projectId },
  ...(filters ? generateSearchFilters(filters, uid) : {}),
});
export const searchCorpusTextSearch = (
  keyword: string,
  regex: SearchRegExp,
  projectId: string,
): { [key: string]: any } => ({
  $and: [
    {
      $or: [
        { title: keyword },
        { title: { $regex: regex.wordReg } },
        { body: keyword },
        { body: { $regex: regex.definitionsReg } },
      ],
    },
    { projectId: { $eq: projectId } },
  ],
});
export const searchIgboTextSearch = (
  uid: string,
  keyword: string,
  regex: SearchRegExp,
  projectId: string,
  filters?: { [key: string]: string | Types.ObjectId },
): { [key: string]: any } => ({
  ...fullTextSearchQuery(keyword, regex),
  ...(filters ? generateSearchFilters(filters, uid) : {}),
  projectId: { $eq: new Types.ObjectId(projectId) },
});
/* Since the word field is not non-accented yet,
 * a strict regex search for words has to be used as a workaround */
export const strictSearchIgboQuery = (
  word: string,
  projectId: string,
): { word: RegExp; projectId: { $eq: Types.ObjectId } } => ({
  word: createRegExp(word, true).wordReg,
  projectId: { $eq: new Types.ObjectId(projectId) },
});
export const searchDeveloperWithHostsQuery = hostsQuery;
export const searchForAllWordsWithAudioPronunciations = ({
  projectId,
}: {
  projectId: string;
}): { pronunciation: any; $expr: any; projectId: { $eq: string } } => ({
  pronunciation: { $exists: true, $type: 'string' },
  $expr: { $gt: [{ $strLenCP: '$pronunciation' }, 10] },
  projectId: { $eq: projectId },
});
export const searchForAllWordsWithIsStandardIgbo = ({
  projectId,
}: {
  projectId: string;
}): { attributes: { isStandardIgbo: boolean }; projectId: { $eq: string } } => ({
  // @ts-ignore
  'attributes.isStandardIgbo': true,
  projectId: { $eq: projectId },
});
export const searchForAllWordsWithNsibidi = (): { $and: any } => ({
  $and: [{ 'definitions.nsibidi': { $ne: null } }, { 'definitions.nsibidi': { $ne: '' } }],
});
export const searchForAssociatedWordSuggestions = (
  wordId: string,
  projectId: string,
): {
  originalWordId: string;
  merged: { $eq: null };
  projectId: { $eq: string };
} => ({
  originalWordId: wordId,
  merged: { $eq: null },
  projectId: { $eq: projectId },
});
export const searchForAssociatedExampleSuggestions = (
  wordId: string,
  projectId: string,
): {
  originalExampleId: string;
  merged: { $eq: null };
  projectId: { $eq: string };
} => ({
  originalExampleId: wordId,
  merged: { $eq: null },
  projectId: { $eq: projectId },
});
export const searchForAssociatedSuggestionsByTwitterId = (
  twitterPollId: string,
  projectId: string,
): {
  twitterPollId: string;
  merged: { $eq: null };
  projectId: { $eq: string };
} => ({
  twitterPollId,
  merged: { $eq: null },
  projectId: { $eq: projectId },
});
export const searchWordsWithoutIgboDefinitions = ({
  projectId,
}: {
  projectId: string;
}): {
  [key: string]: { $exists: boolean } | { $eq: string };
} => ({
  'definitions.0.igboDefinitions.0': { $exists: false },
  projectId: { $eq: projectId },
});
export const searchWordSuggestionsWithoutIgboDefinitionsFromLastMonth = ({
  projectId,
}: {
  projectId: string;
}): {
  [key: string]: { $exists: boolean } | { $gte: number } | { $ne: string } | { $eq: string } | null;
} => ({
  'definitions.0.igboDefinitions.0': { $exists: false },
  origin: { $ne: SuggestionSourceEnum.COMMUNITY },
  updatedAt: { $gte: moment().subtract(1, 'months').startOf('month').valueOf() },
  projectId: { $eq: projectId },
  merged: null,
});
export const searchWordSuggestionsOlderThanAYear = ({
  projectId,
}: {
  projectId: string;
}): {
  [key: string]: { $lte: number } | { $ne: SuggestionSourceEnum } | { $eq: string } | null;
} => ({
  createdAt: { $lte: moment().subtract(1, 'year').valueOf() },
  origin: { $ne: SuggestionSourceEnum.COMMUNITY }, // Do not delete Word Suggestions from Nkọwa okwu users
  merged: null,
  projectId: { $eq: projectId },
});
/**
 * Gets example suggestions where the user's audio has been fully approved
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
 * Gets example suggestions where the user's audio has been fully denied
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
