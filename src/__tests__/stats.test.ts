import { getUserStats } from './shared/commands';
import { AUTH_TOKEN } from './shared/constants';

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
  });
});
