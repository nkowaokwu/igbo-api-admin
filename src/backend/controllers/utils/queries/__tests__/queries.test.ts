import moment from 'moment';
import { Types } from 'mongoose';
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
  searchRandomExampleSuggestionsToTranslateRegexQuery,
  searchWordSuggestionsOlderThanAYear,
  titleQuery,
  variationsQuery,
  wordQuery,
} from 'src/backend/controllers/utils/queries/queries';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import createRegExp from 'src/backend/shared/utils/createRegExp';

describe('queries', () => {
  const uid = 'uid';
  const igbo = 'igbo';
  const regex = createRegExp('word');
  const filters = { examples: 'true' };
  const projectId = new Types.ObjectId().toString();

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
    const query = searchWordSuggestionsOlderThanAYear({ projectId });
    expect(query).toStrictEqual({
      createdAt: query.createdAt,
      origin: { $ne: SuggestionSourceEnum.COMMUNITY },
      projectId: { $eq: projectId },
      merged: null,
    });
  });

  it('searchRandomExampleSuggestionsToRecordRegexQuery', () => {
    const query = searchRandomExampleSuggestionsToRecordRegexQuery(uid, projectId, [LanguageEnum.IGBO]);
    expect(query).toStrictEqual({
      merged: null,
      exampleForSuggestion: { $ne: true },
      'source.text': { $exists: true, $type: 'string' },
      $expr: { $gt: [{ $strLenCP: '$source.text' }, 6] },
      origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH },
      'source.language': { $in: [LanguageEnum.IGBO] },
      'source.pronunciations.speaker': { $nin: [uid] },
      'source.pronunciations.3.audio': { $exists: false },
      updatedAt: { $gte: moment('2023-01-01').toDate() },
      projectId: { $eq: projectId },
    });
  });

  it('searchRandomExampleSuggestionsToTranslateRegexQuery', () => {
    const query = searchRandomExampleSuggestionsToTranslateRegexQuery({
      uid,
      projectId,
      languages: [LanguageEnum.IGBO, LanguageEnum.ENGLISH],
    });
    expect(query).toStrictEqual({
      $or: [
        {
          'source.language': { $in: [LanguageEnum.IGBO, LanguageEnum.ENGLISH] },
          'translations.0': { $exists: false },
        },
        {
          'source.language': { $eq: LanguageEnum.IGBO },
          $or: [
            {
              'translations.authorId': { $ne: uid },
              'translations.language': { $ne: LanguageEnum.ENGLISH },
            },
          ],
        },
        {
          'source.language': { $eq: LanguageEnum.ENGLISH },
          $or: [
            {
              'translations.authorId': { $ne: uid },
              'translations.language': { $ne: LanguageEnum.IGBO },
            },
          ],
        },
      ],
      exampleForSuggestion: { $ne: true },
      merged: null,
      origin: { $ne: SuggestionSourceEnum.IGBO_SPEECH },
      projectId: { $eq: projectId },
    });
  });

  it('searchPreExistingExampleSuggestionsRegexQuery', () => {
    const query = searchPreExistingExampleSuggestionsRegexQuery({ text: igbo });
    expect(query).toStrictEqual({ 'source.text': igbo, merged: null });
  });

  it('searchPreExistingWordSuggestionsRegexQuery - no filters', () => {
    const query = searchPreExistingWordSuggestionsRegexQuery(uid, regex, projectId);
    expect(query).toStrictEqual({
      $or: [wordQuery(regex), variationsQuery(regex)],
      projectId: { $eq: projectId },
      merged: null,
    });
  });

  it('searchPreExistingWordSuggestionsRegexQuery - filters', () => {
    const query = searchPreExistingWordSuggestionsRegexQuery(uid, regex, projectId);
    expect(query).toStrictEqual({
      $or: [wordQuery(regex), variationsQuery(regex)],
      projectId: { $eq: projectId },
      merged: null,
      ...generateSearchFilters(filters, uid),
    });
  });

  it('searchPreExistingCorpusSuggestionsRegexQuery - no filters', () => {
    const query = searchPreExistingCorpusSuggestionsRegexQuery(uid, regex, projectId);
    expect(query).toStrictEqual({
      $or: [titleQuery(regex), bodyQuery(regex)],
      merged: null,
      projectId: { $eq: projectId },
    });
  });

  it('searchPreExistingCorpusSuggestionsRegexQuery - filters', () => {
    const query = searchPreExistingCorpusSuggestionsRegexQuery(uid, regex, projectId, filters);
    expect(query).toStrictEqual({
      $or: [titleQuery(regex), bodyQuery(regex)],
      merged: null,
      projectId: { $eq: projectId },
      ...generateSearchFilters(filters, uid),
    });
  });

  it('searchCorpusTextSearch - no filters', () => {
    const query = searchCorpusTextSearch(uid, regex, projectId);
    expect(query).toStrictEqual({
      $and: [
        {
          $or: [
            { title: uid },
            { title: { $regex: regex.wordReg } },
            { body: uid },
            { body: { $regex: regex.definitionsReg } },
          ],
        },
        { projectId: { $eq: projectId } },
      ],
    });
  });

  it('searchCorpusTextSearch - filters', () => {
    const query = searchCorpusTextSearch(uid, regex, projectId);
    expect(query).toStrictEqual({
      $and: [
        {
          $or: [
            { title: uid },
            { title: { $regex: regex.wordReg } },
            { body: uid },
            { body: { $regex: regex.definitionsReg } },
          ],
        },
        { projectId: { $eq: projectId } },
      ],
    });
  });

  it('searchCorpusTextSearch', () => {
    const query = searchCorpusTextSearch(igbo, regex, projectId);
    expect(query).toStrictEqual({
      $and: [
        {
          $or: [
            { title: igbo },
            { title: { $regex: regex.wordReg } },
            { body: igbo },
            { body: { $regex: regex.definitionsReg } },
          ],
        },
        { projectId: { $eq: projectId } },
      ],
    });
  });

  it('searchIgboTextSearch - no filters', () => {
    const query = searchIgboTextSearch(uid, igbo, regex, projectId);
    expect(query).toStrictEqual({
      ...fullTextSearchQuery(igbo, regex),
      projectId: { $eq: projectId },
    });
  });

  it('searchIgboTextSearch - filters', () => {
    const query = searchIgboTextSearch(uid, igbo, regex, projectId);
    expect(query).toStrictEqual({
      ...fullTextSearchQuery(igbo, regex),
      ...(filters ? generateSearchFilters(filters, uid) : {}),
      projectId: { $eq: projectId },
    });
  });
});
