import { searchWordSuggestionsOlderThanAYear } from 'src/backend/controllers/utils/queries/queries';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';

describe('queries', () => {
  it('searchWordSuggestionsOlderThanAYear', () => {
    const query = searchWordSuggestionsOlderThanAYear();
    expect(query).toStrictEqual({
      createdAt: query.createdAt,
      source: { $ne: SuggestionSourceEnum.COMMUNITY },
      merged: null,
    });
  });
});
