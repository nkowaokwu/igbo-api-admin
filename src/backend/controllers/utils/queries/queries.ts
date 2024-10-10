import { has, omit } from 'lodash';
import moment from 'moment';
import { Types } from 'mongoose';
import createRegExp from 'src/backend/shared/utils/createRegExp';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import Tense from 'src/backend/shared/constants/Tense';
import { SearchRegExp } from 'src/backend/controllers/utils/interfaces';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';

const EXAMPLE_PRONUNCIATION_LIMIT = 3;
type ExampleSearchQuery = [{ 'source.text': RegExp }, { 'translations.text': RegExp }];

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

export const generateSearchFilters = (filters: { [key: string]: string }): { [key: string]: any } => {
  let searchFilters: Filters = filters
    ? Object.entries(filters).reduce((allFilters: Filters, [key, value]) => {
        allFilters.$or = allFilters.$or || [];

        switch (key) {
          // Examples
          case 'source.text':
            allFilters['source.text'] = { $regex: value };
            break;
          case 'source.language':
            allFilters['source.language'] = { $in: value };
            break;
          case 'source.pronunciations.speaker':
            allFilters['source.pronunciations.speaker'] = { $in: value };
            break;
          case 'translations.text':
            allFilters['translations.text'] = { $regex: value };
            break;
          case 'translations.language':
            allFilters['translations.language'] = { $in: value };
            break;
          case 'translations.pronunciations.speaker':
            allFilters['translations.pronunciations.speaker'] = { $in: value };
            break;
          case 'origin':
            allFilters.origin = { $in: value };
            break;

          // Words
          case 'word':
            allFilters.word = { $regex: value };
            break;
          case 'definitions.nsibidi':
            allFilters['definitions.nsibidi'] = { $exists: value };
            break;
          case 'definitions.wordClass':
            allFilters['definitions.wordClass'] = { $in: value };
            break;
          case 'authorId':
            allFilters.authorId = { $in: value };
            break;
          case 'definitions.definitions':
            allFilters['definitions.definitions'] = { $regex: value };
            break;
          case 'definitions.igboDefinitions.igbo':
            allFilters['definitions.igboDefinitions.igbo'] = { $regex: value };
            break;
          case 'pronunciation':
            allFilters.pronunciation = { $exists: value };
            break;
          case 'merged':
            allFilters.merged = value === 'true' ? { $ne: null } : { $eq: null };
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
  regex: SearchRegExp,
  filters: { [key: string]: string },
  projectId: string,
): { $or: ExampleSearchQuery; archived: { [key: string]: boolean }; projectId: { $eq: Types.ObjectId } } => ({
  $or: [{ 'source.text': regex.wordReg }, { 'translations.text': regex.definitionsReg }],
  archived: { $ne: true },
  projectId: { $eq: new Types.ObjectId(projectId) },
  ...(filters ? generateSearchFilters(filters) : {}),
});

export const searchExampleSuggestionsRegexQuery = (
  regex: SearchRegExp,
  projectId: string,
  filters: { [key: string]: string },
): {
  $or: ExampleSearchQuery;
  exampleForSuggestion: boolean;
  projectId: { $eq: Types.ObjectId };
  merged: null;
} => ({
  $or: [{ 'source.text': regex.wordReg }, { 'translations.text': regex.definitionsReg }],
  exampleForSuggestion: false,
  merged: null,
  projectId: { $eq: new Types.ObjectId(projectId) },
  ...(filters ? generateSearchFilters(filters) : {}),
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
  languages: string[],
): {
  merged: null;
  exampleForSuggestion: { $ne: true };
  'source.text': { $exists: boolean; $type: string };
  'source.language': { $in: string[] };
  $expr: { $gt: ({ $strLenCP: string } | number)[] };
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH };
  updatedAt: { $gte: Date };
  // @ts-expect-error
  [`source.pronunciations.${EXAMPLE_PRONUNCIATION_LIMIT}.audio`]: { $exists: false };
  'source.pronunciations.speaker': { $nin: [string] };
  projectId: { $eq: Types.ObjectId };
} => ({
  merged: null,
  exampleForSuggestion: { $ne: true },
  'source.text': { $exists: true, $type: 'string' },
  'source.language': { $in: languages },
  $expr: { $gt: [{ $strLenCP: '$source.text' }, 6] },
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH },
  [`source.pronunciations.${EXAMPLE_PRONUNCIATION_LIMIT}.audio`]: { $exists: false },
  updatedAt: { $gte: moment('2023-01-01').toDate() },
  // Returns an example where the user hasn't approved or denied an audio pronunciation
  'source.pronunciations.speaker': { $nin: [uid] },
  projectId: { $eq: new Types.ObjectId(projectId) },
});

/**
 * Returns ExampleSuggestion documents that are marked for review
 * @param uid
 * @returns
 */
export const searchRandomExampleSuggestionsToReviewRegexQuery = ({
  uid,
  projectId,
  languages,
}: {
  uid: string;
  projectId: string;
  languages: string[];
}): {
  merged: null;
  exampleForSuggestion: { $ne: true };
  'source.pronunciations.review': true;
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH };
  updatedAt: { $gte: Date };
  'source.language': { $in: string[] };
  'source.pronunciations': { $elemMatch: { $and: { [key: string]: { $nin: [string] } }[] } };
  projectId: { $eq: Types.ObjectId };
} => ({
  merged: null,
  exampleForSuggestion: { $ne: true },
  'source.pronunciations.review': true,
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH },
  // Only looks at the data collection sentences uploaded starting from 2023
  updatedAt: { $gte: moment('2023-01-01').toDate() },
  'source.language': { $in: languages },
  // Returns an example where the user hasn't approved or denied an audio pronunciation
  'source.pronunciations': {
    $elemMatch: {
      $and: [{ approvals: { $nin: [uid] } }, { denials: { $nin: [uid] } }],
    },
  },
  projectId: { $eq: new Types.ObjectId(projectId) },
});

/**
 * ProjectType.TRANSLATE
 */
/**
 * Returns ExampleSuggestion documents that need translations
 * @param uid
 * @returns ExampleSuggestions documents query
 */
export const searchRandomExampleSuggestionsToTranslateRegexQuery = ({
  uid,
  projectId,
  languages,
}: {
  uid: string;
  projectId: string;
  languages: LanguageEnum[];
}): {
  merged: null;
  exampleForSuggestion: { $ne: true };
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH };
  $or: {
    [key: string]:
      | { $in: LanguageEnum[] }
      | { $exists: false }
      | { $eq: LanguageEnum }
      | { 'translations.language': { $ne: LanguageEnum } }[];
  }[];
  projectId: { $eq: Types.ObjectId };
} => ({
  merged: null,
  exampleForSuggestion: { $ne: true },
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH },
  $or: [
    // If the sentence has no translations, we want to match
    {
      'source.language': { $in: languages },
      'translations.0': { $exists: false },
    },
    // If there are translations then we want to match when there
    // is no existing translation for a language the user can translate
    ...languages.map((language) => {
      const otherLanguages = languages.filter((currentLanguage) => currentLanguage !== language);
      return {
        'source.language': { $eq: language },
        $or: otherLanguages.map((otherLanguage) => ({
          'translations.language': { $ne: otherLanguage },
          'translations.authorId': { $ne: uid },
        })),
      };
    }),
  ],
  projectId: { $eq: new Types.ObjectId(projectId) },
});

/**
 * Returns ExampleSuggestion documents that need to be reviewed for translation
 * @param uid
 * @returns ExampleSuggestion document query
 */
export const searchRandomExampleSuggestionsToReviewTranslationsRegexQuery = ({
  uid,
  projectId,
  languages,
}: {
  uid: string;
  projectId: string;
  languages: LanguageEnum[];
}): {
  merged: null;
  exampleForSuggestion: { $ne: true };
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH };
  'source.language': { $in: LanguageEnum[] };
  translations: {
    $elemMatch: {
      language: { $in: LanguageEnum[] };
      $and: { [key: string]: { $nin: [string] } }[];
    };
  };
  projectId: { $eq: Types.ObjectId };
} => ({
  merged: null,
  exampleForSuggestion: { $ne: true },
  origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH },
  'source.language': { $in: languages },
  translations: {
    $elemMatch: {
      language: { $in: languages },
      $and: [{ approvals: { $nin: [uid] } }, { denials: { $nin: [uid] } }],
    },
  },
  projectId: { $eq: new Types.ObjectId(projectId) },
});

export const searchPreExistingExampleSuggestionsRegexQuery = ({
  text,
}: {
  text: string;
}): { 'source.text': string; merged: null } => ({
  'source.text': text,
  merged: null,
});
export const searchPreExistingWordSuggestionsRegexQuery = (
  regex: SearchRegExp,
  projectId: string,
  filters?: { [key: string]: string },
): {
  $or: ({ word: { $regex: RegExp } } | { variations: { $in: [RegExp] } })[];
  merged: null;
  projectId: { $eq: Types.ObjectId };
  updatedAt?: any;
} => ({
  $or: [wordQuery(regex), variationsQuery(regex)],
  merged: null,
  projectId: { $eq: new Types.ObjectId(projectId) },
  ...(filters ? generateSearchFilters(filters) : {}),
});
export const searchPreExistingCorpusSuggestionsRegexQuery = (
  regex: SearchRegExp,
  projectId: string,
  filters?: { [key: string]: string },
): {
  $or: ({ title: { $regex: RegExp } } | { body: { $regex: RegExp } })[];
  projectId: { $eq: Types.ObjectId };
  merged: null;
} => ({
  $or: [titleQuery(regex), bodyQuery(regex)],
  merged: null,
  projectId: { $eq: new Types.ObjectId(projectId) },
  ...(filters ? generateSearchFilters(filters) : {}),
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
    { projectId: { $eq: new Types.ObjectId(projectId) } },
  ],
});
export const searchIgboTextSearch = (
  keyword: string,
  regex: SearchRegExp,
  projectId: string,
  filters?: { [key: string]: string | Types.ObjectId },
): { [key: string]: any } => ({
  ...fullTextSearchQuery(keyword, regex),
  ...(filters ? generateSearchFilters(filters) : {}),
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
}): { pronunciation: any; $expr: any; projectId: { $eq: Types.ObjectId } } => ({
  pronunciation: { $exists: true, $type: 'string' },
  $expr: { $gt: [{ $strLenCP: '$pronunciation' }, 10] },
  projectId: { $eq: new Types.ObjectId(projectId) },
});
export const searchForAllWordsWithIsStandardIgbo = ({
  projectId,
}: {
  projectId: string;
}): { attributes: { isStandardIgbo: boolean }; projectId: { $eq: Types.ObjectId } } => ({
  // @ts-ignore
  'attributes.isStandardIgbo': true,
  projectId: { $eq: new Types.ObjectId(projectId) },
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
  projectId: { $eq: Types.ObjectId };
} => ({
  originalWordId: wordId,
  merged: { $eq: null },
  projectId: { $eq: new Types.ObjectId(projectId) },
});
export const searchForAssociatedExampleSuggestions = (
  wordId: string,
  projectId: string,
): {
  originalExampleId: string;
  merged: { $eq: null };
  projectId: { $eq: Types.ObjectId };
} => ({
  originalExampleId: wordId,
  merged: { $eq: null },
  projectId: { $eq: new Types.ObjectId(projectId) },
});
export const searchForAssociatedSuggestionsByTwitterId = (
  twitterPollId: string,
  projectId: string,
): {
  twitterPollId: string;
  merged: { $eq: null };
  projectId: { $eq: Types.ObjectId };
} => ({
  twitterPollId,
  merged: { $eq: null },
  projectId: { $eq: new Types.ObjectId(projectId) },
});
export const searchWordsWithoutIgboDefinitions = ({
  projectId,
}: {
  projectId: string;
}): {
  [key: string]: { $exists: boolean } | { $eq: string };
} => ({
  'definitions.0.igboDefinitions.0': { $exists: false },
  projectId: { $eq: new Types.ObjectId(projectId) },
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
  projectId: { $eq: new Types.ObjectId(projectId) },
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
  projectId: { $eq: new Types.ObjectId(projectId) },
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

/**
 * Gets information for total merged recorded Example suggestions for user
 * @param param0
 * @returns Query
 */
export const searchTotalMergedRecordedExampleSuggestionsForUser = ({
  uid,
  projectId,
}: {
  uid: string;
  projectId: string;
}): {
  'source.pronunciations.audio': { $regex: RegExp; $type: string };
  'source.pronunciations.speaker': string;
  'source.pronunciations.review': boolean;
  merged: { $ne: null };
  projectId: { $eq: Types.ObjectId };
} => ({
  'source.pronunciations.audio': { $regex: /^http/, $type: 'string' },
  'source.pronunciations.speaker': uid,
  'source.pronunciations.review': true,
  merged: { $ne: null },
  projectId: { $eq: new Types.ObjectId(projectId) },
});

/**
 * Gets information for total recorded Example suggestions for user
 * @param param0
 * @returns Query
 */
export const searchTotalRecordedExampleSuggestionsForUser = ({
  uid,
  projectId,
}: {
  uid: string;
  projectId: string;
}): {
  'denials.1': { $exists: boolean };
  $or: [
    {
      'source.pronunciations.audio': { $regex: RegExp; $type: string };
      'source.pronunciations.speaker': string;
      'source.pronunciations.review': boolean;
    },
    {
      'translations.pronunciations.audio': { $regex: RegExp; $type: string };
      'translations.pronunciations.speaker': string;
    },
  ];
  projectId: { $eq: Types.ObjectId };
} => ({
  'denials.1': { $exists: false },
  $or: [
    {
      'source.pronunciations.audio': { $regex: /^http/, $type: 'string' },
      'source.pronunciations.speaker': uid,
      'source.pronunciations.review': true,
    },
    {
      'translations.pronunciations.audio': { $regex: /^http/, $type: 'string' },
      'translations.pronunciations.speaker': uid,
    },
  ],
  projectId: { $eq: new Types.ObjectId(projectId) },
});

/**
 * Gets documents that include current user as an author for a translation
 * @param param0
 * @returns
 */
export const searchTotalTranslationsOnExampleSuggestionsForUser = ({
  uid,
  projectId,
}: {
  uid: string;
  projectId: string;
}): {
  'translations.authorId': { $eq: string };
  projectId: { $eq: Types.ObjectId };
} => ({
  'translations.authorId': { $eq: uid },
  projectId: { $eq: new Types.ObjectId(projectId) },
});
