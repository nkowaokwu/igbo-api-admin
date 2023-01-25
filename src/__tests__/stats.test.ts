import moment from 'moment';
import {
  getUserStats,
  getUserMergeStats,
  suggestNewWord,
  createWord,
  updateWordSuggestion,
} from './shared/commands';
import { AUTH_TOKEN } from './shared/constants';
import { wordSuggestionData } from './__mocks__/documentData';

describe('MongoDB Stats', () => {
  describe('/GET mongodb stats', () => {
    it('should get all user stats', async () => {
      const res = await getUserStats(AUTH_TOKEN.MERGER_AUTH_TOKEN);
      expect(res.body.approvedWordSuggestionsCount).toBeGreaterThanOrEqual(0);
      expect(res.body.deniedWordSuggestionsCount).toBeGreaterThanOrEqual(0);
      expect(res.body.approvedExampleSuggestionsCount).toBeGreaterThanOrEqual(0);
      expect(res.body.deniedExampleSuggestionsCount).toBeGreaterThanOrEqual(0);
      expect(res.body.authoredWordSuggestionsCount).toBeGreaterThanOrEqual(0);
      expect(res.body.authoredExampleSuggestionsCount).toBeGreaterThanOrEqual(0);
      expect(res.body.mergedWordSuggestionsCount).toBeGreaterThanOrEqual(0);
      expect(res.body.mergedExampleSuggestionsCount).toBeGreaterThanOrEqual(0);
      expect(res.body.mergedByUserWordSuggestionsCount).toBeGreaterThanOrEqual(0);
      expect(res.body.mergedByUserExampleSuggestionsCount).toBeGreaterThanOrEqual(0);
      expect(res.body.currentEditingWordSuggestionsCount).toBeGreaterThanOrEqual(0);
      expect(res.body.currentEditingExampleSuggestionsCount).toBeGreaterThanOrEqual(0);
    });

    it('should get all user merge stats', async () => {
      const res = await getUserMergeStats(AUTH_TOKEN.MERGER_AUTH_TOKEN);
      expect(res.body.exampleSuggestionMerges).not.toBeUndefined();
      expect(res.body.dialectalVariationMerges).not.toBeUndefined();
    });

    it('should add three more dialectal variations after merging to stats', async () => {
      const dialects = [
        {
          word: 'dialect',
          pronunciation: 'data://',
          dialects: [],
          variations: [],
        },
        {
          word: 'second dialect',
          pronunciation: 'data://',
          dialects: [],
          variations: [],
        },
        {
          word: 'third dialects',
          pronunciation: 'data://',
          dialects: [],
          variations: [],
        },
      ];
      const isoWeek = moment().startOf('week').toISOString();
      const firstStatsRes = await getUserMergeStats(AUTH_TOKEN.MERGER_AUTH_TOKEN);
      const currentWeekMergedDialects: number = firstStatsRes.body.dialectalVariationMerges[isoWeek];
      const wordSuggestionRes = await suggestNewWord({
        ...wordSuggestionData,
        dialects,
      }, { noApprovals: true, token: AUTH_TOKEN.MERGER_AUTH_TOKEN, cleanData: true });
      await createWord(wordSuggestionRes.body.id);
      const secondStatsRes = await getUserMergeStats(AUTH_TOKEN.MERGER_AUTH_TOKEN);
      const updatedCurrentWeekMergedDialects: number = secondStatsRes.body.dialectalVariationMerges[isoWeek];
      // + 1 to include the headword
      expect(currentWeekMergedDialects + dialects.length + 1).toEqual(updatedCurrentWeekMergedDialects);
    });

    it('should update dialectal variations with different authors (editors) stats count', async () => {
      const dialects = [
        {
          word: 'dialect',
          pronunciation: 'data://',
          dialects: [],
          variations: [],
        },
        {
          word: 'second dialect',
          pronunciation: 'data://',
          dialects: [],
          variations: [],
        },
        {
          word: 'third dialects',
          pronunciation: 'data://',
          dialects: [],
          variations: [],
        },
      ];
      const isoWeek = moment().startOf('week').toISOString();
      const mergerStatsRes = await getUserMergeStats(AUTH_TOKEN.MERGER_AUTH_TOKEN);
      const adminStatsRes = await getUserMergeStats(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      const currentWeekMergedDialectsForMerger: number = mergerStatsRes.body.dialectalVariationMerges[isoWeek];
      const currentWeekMergedDialectsForAdmin: number = adminStatsRes.body.dialectalVariationMerges[isoWeek];
      const wordSuggestionRes = await suggestNewWord({
        ...wordSuggestionData,
        dialects,
      }, { noApprovals: true, token: AUTH_TOKEN.MERGER_AUTH_TOKEN, cleanData: true });
      const updatedWordSuggestionRes = await updateWordSuggestion({
        ...wordSuggestionRes.body,
        dialects: [
          ...wordSuggestionRes.body.dialects,
          {
            word: 'fourth dialect',
            pronunciation: 'data://',
            dialects: [],
            variations: [],
          },
        ],
      });
      await createWord(updatedWordSuggestionRes.body.id);
      const updatedMergerStatsRes = await getUserMergeStats(AUTH_TOKEN.MERGER_AUTH_TOKEN);
      const updatedAdminStatsRes = await getUserMergeStats(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      const updatedCurrentWeekMergedDialectsForMerger: number = (
        updatedMergerStatsRes.body.dialectalVariationMerges[isoWeek]
      );
      const updatedCurrentWeekMergedDialectsForAdmin: number = (
        updatedAdminStatsRes.body.dialectalVariationMerges[isoWeek]
      );
      // + 1 to include the headword
      expect(currentWeekMergedDialectsForMerger + dialects.length + 1)
        .toEqual(updatedCurrentWeekMergedDialectsForMerger);
      expect(currentWeekMergedDialectsForAdmin + 1).toEqual(updatedCurrentWeekMergedDialectsForAdmin);
    });

    it('should update examples with different authors (editors) stats count', async () => {
      const examples = [
        {
          igbo: 'first igbo',
          english: 'first english',
          pronunciation: 'data://',
          associatedWords: [],
        },
        {
          igbo: 'second igbo',
          english: 'second english',
          pronunciation: 'data://',
          associatedWords: [],
        },
        {
          igbo: 'third igbo',
          english: 'third english',
          pronunciation: 'data://',
          associatedWords: [],
        },
      ];
      const mergerStatsRes = await getUserMergeStats(AUTH_TOKEN.MERGER_AUTH_TOKEN);
      const adminStatsRes = await getUserMergeStats(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      const isoWeek = moment().startOf('week').toISOString();
      const currentWeekMergedExamplesForMerger: number = mergerStatsRes.body.exampleSuggestionMerges[isoWeek];
      const currentWeekMergedExamplesForAdmin: number = adminStatsRes.body.exampleSuggestionMerges[isoWeek];
      const wordSuggestionRes = await suggestNewWord({
        ...wordSuggestionData,
        examples,
      }, { noApprovals: true, token: AUTH_TOKEN.MERGER_AUTH_TOKEN, cleanData: true });
      const updatedWordSuggestionRes = await updateWordSuggestion({
        ...wordSuggestionRes.body,
        examples: [
          ...wordSuggestionRes.body.examples,
          {
            igbo: 'fourth igbo',
            english: 'fourth english',
            pronunciation: 'data://',
            associatedWords: [],
          },
        ],
      });
      await createWord(updatedWordSuggestionRes.body.id);
      const updatedMergerStatsRes = await getUserMergeStats(AUTH_TOKEN.MERGER_AUTH_TOKEN);
      const updatedAdminStatsRes = await getUserMergeStats(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      const updatedCurrentWeekMergedExamplesForMerger: number = (
        updatedMergerStatsRes.body.exampleSuggestionMerges[isoWeek]
      );
      const updatedCurrentWeekMergedExamplesForAdmin: number = (
        updatedAdminStatsRes.body.exampleSuggestionMerges[isoWeek]
      );
      expect(currentWeekMergedExamplesForMerger + examples.length).toEqual(updatedCurrentWeekMergedExamplesForMerger);
      expect(currentWeekMergedExamplesForAdmin + 1).toEqual(updatedCurrentWeekMergedExamplesForAdmin);
    });
  });
});
