import moment from 'moment';
import {
  bodyQuery,
  fullTextSearchQuery,
  generateSearchFilters,
  searchCorpusTextSearch,
  searchIgboTextSearch,
  searchPreExistingCorpusSuggestionsRegexQuery,
  searchPreExistingExampleSuggestionsRegexQuery,
  searchPreExistingWordSuggestionsRegexQuery,
  searchRandomExampleSuggestionsToRecordRegexQuery,
  searchRandomExampleSuggestionsToReviewRegexQuery,
  searchRandomExampleSuggestionsToTranslateRegexQuery,
  searchWordSuggestionsOlderThanAYear,
  titleQuery,
  variationsQuery,
  wordQuery,
} from 'src/backend/controllers/utils/queries/queries';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import createRegExp from 'src/backend/shared/utils/createRegExp';

describe('queries', () => {
  const uid = 'uid';
  const igbo = 'igbo';
  const regex = createRegExp('word');
  const filters = { examples: 'true' };

  it('titleQuery', () => {
    const query = titleQuery(regex);
    expect(query).toStrictEqual({ title: { $regex: regex.wordReg } });
  });

  it('wordQuery', () => {
    const query = wordQuery(regex);
    expect(query).toStrictEqual({ word: { $regex: regex.wordReg } });
  });

  it('fullTextSearchQuery', () => {
    const query = fullTextSearchQuery(igbo, regex);
    expect(query).toStrictEqual({
      $or: [
        {
          word: 'igbo',
        },
        {
          word: {
            $regex: /(\W|^)((?:^|[^a-zA-ZÀ-ụ])(w)([oOòóōọÒÓŌỌ]+[´́`¯̣̄̀]{0,})(r)(d)(?:es|[sx]|ing)?)(\W|$)/i,
          },
        },
        {
          'definitions.definitions': {
            $in: [/(\W|^)((w)([oOòóōọÒÓŌỌ]+[´́`¯̣̄̀]{0,})(r)(d)(?:es|[sx]|ing)?)(\W|$)/i],
          },
        },
        {
          variations: 'igbo',
        },
        {
          nsibidi: 'igbo',
        },
        {
          'dialects.igbo': {
            $exists: true,
          },
        },
        {
          'tenses.infinitive': 'igbo',
        },
        {
          'tenses.imperative': 'igbo',
        },
        {
          'tenses.simplePast': 'igbo',
        },
        {
          'tenses.presentPassive': 'igbo',
        },
        {
          'tenses.simplePresent': 'igbo',
        },
        {
          'tenses.presentContinuous': 'igbo',
        },
        {
          'tenses.future': 'igbo',
        },
      ],
    });
  });

  it('fullTextSearchQuery - no keyword', () => {
    const query = fullTextSearchQuery('', regex);
    expect(query).toStrictEqual({ word: { $regex: /./ } });
  });

  it('searchWordSuggestionsOlderThanAYear', () => {
    const query = searchWordSuggestionsOlderThanAYear();
    expect(query).toStrictEqual({
      createdAt: query.createdAt,
      origin: { $ne: SuggestionSourceEnum.COMMUNITY },
      merged: null,
    });
  });

  it('searchRandomExampleSuggestionsToRecordRegexQuery', () => {
    const query = searchRandomExampleSuggestionsToRecordRegexQuery(uid);
    expect(query).toStrictEqual({
      merged: null,
      exampleForSuggestion: { $ne: true },
      igbo: { $exists: true, $type: 'string' },
      $expr: { $gt: [{ $strLenCP: '$igbo' }, 6] },
      type: SentenceTypeEnum.DATA_COLLECTION,
      origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH },
      'pronunciations.3.audio': { $exists: false },
      updatedAt: { $gte: moment('2023-01-01').toDate() },
      'pronunciations.speaker': { $nin: [uid] },
    });
  });

  it('searchRandomExampleSuggestionsToReviewRegexQuery', () => {
    const query = searchRandomExampleSuggestionsToReviewRegexQuery({ uid, isLacunaFundExtensionCrowdsourcer: false });
    expect(query).toStrictEqual({
      merged: null,
      exampleForSuggestion: { $ne: true },
      'pronunciations.review': true,
      type: SentenceTypeEnum.DATA_COLLECTION,
      origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH },
      'pronunciations.3.audio': { $exists: false },
      updatedAt: { $gte: moment('2023-01-01').toDate() },
      'pronunciations.speaker': { $nin: [uid] },
      pronunciations: {
        $elemMatch: {
          $and: [{ approvals: { $nin: [uid] } }, { denials: { $nin: [uid] } }],
        },
      },
    });
  });

  it('searchRandomExampleSuggestionsToTranslateRegexQuery', () => {
    const query = searchRandomExampleSuggestionsToTranslateRegexQuery(uid);
    expect(query).toStrictEqual({
      merged: null,
      translations: { $elemMatch: { text: '' } },
      exampleForSuggestion: { $ne: true },
      origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH },
      'pronunciations.0.audio': { $exists: true, $type: 'string', $ne: '' },
      pronunciations: {
        $elemMatch: {
          $and: [{ approvals: { $nin: [uid] } }, { denials: { $nin: [uid] } }],
        },
      },
    });
  });

  it('searchPreExistingExampleSuggestionsRegexQuery', () => {
    const query = searchPreExistingExampleSuggestionsRegexQuery({ igbo });
    expect(query).toStrictEqual({ igbo, merged: null });
  });

  it('searchPreExistingWordSuggestionsRegexQuery - no filters', () => {
    const query = searchPreExistingWordSuggestionsRegexQuery(uid, regex);
    expect(query).toStrictEqual({
      $or: [wordQuery(regex), variationsQuery(regex)],
      merged: null,
    });
  });

  it('searchPreExistingWordSuggestionsRegexQuery - filters', () => {
    const query = searchPreExistingWordSuggestionsRegexQuery(uid, regex);
    expect(query).toStrictEqual({
      $or: [wordQuery(regex), variationsQuery(regex)],
      merged: null,
      ...generateSearchFilters(filters, uid),
    });
  });

  it('searchPreExistingCorpusSuggestionsRegexQuery - no filters', () => {
    const query = searchPreExistingCorpusSuggestionsRegexQuery(uid, regex);
    expect(query).toStrictEqual({
      $or: [titleQuery(regex), bodyQuery(regex)],
      merged: null,
    });
  });

  it('searchPreExistingCorpusSuggestionsRegexQuery - filters', () => {
    const query = searchPreExistingCorpusSuggestionsRegexQuery(uid, regex, filters);
    expect(query).toStrictEqual({
      $or: [titleQuery(regex), bodyQuery(regex)],
      merged: null,
      ...generateSearchFilters(filters, uid),
    });
  });

  it('searchCorpusTextSearch - no filters', () => {
    const query = searchCorpusTextSearch(uid, regex);
    expect(query).toStrictEqual({
      $or: [
        { title: uid },
        { title: { $regex: regex.wordReg } },
        { body: uid },
        { body: { $regex: regex.definitionsReg } },
      ],
    });
  });

  it('searchCorpusTextSearch - filters', () => {
    const query = searchCorpusTextSearch(uid, regex);
    expect(query).toStrictEqual({
      $or: [
        { title: uid },
        { title: { $regex: regex.wordReg } },
        { body: uid },
        { body: { $regex: regex.definitionsReg } },
      ],
      ...generateSearchFilters(filters, uid),
    });
  });

  it('searchCorpusTextSearch', () => {
    const query = searchCorpusTextSearch(igbo, regex);
    expect(query).toStrictEqual({
      $or: [
        { title: igbo },
        { title: { $regex: regex.wordReg } },
        { body: igbo },
        { body: { $regex: regex.definitionsReg } },
      ],
    });
  });

  it('searchIgboTextSearch - no filters', () => {
    const query = searchIgboTextSearch(uid, igbo, regex);
    expect(query).toStrictEqual({
      ...fullTextSearchQuery(igbo, regex),
    });
  });

  it('searchIgboTextSearch - filters', () => {
    const query = searchIgboTextSearch(uid, igbo, regex);
    expect(query).toStrictEqual({
      ...fullTextSearchQuery(igbo, regex),
      ...(filters ? generateSearchFilters(filters, uid) : {}),
    });
  });
});
