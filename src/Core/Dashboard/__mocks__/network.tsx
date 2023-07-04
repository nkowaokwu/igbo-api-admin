import StatTypes from 'src/backend/shared/constants/StatTypes';

export default jest.fn(async (url = '') => {
  if (url.startsWith('/stats/full')) {
    return {
      body: JSON.stringify(
        Object.values(StatTypes).reduce(
          (finalObject, value) => ({
            ...finalObject,
            [value]: { value: 0 },
          }),
          [],
        ),
      ),
    };
  }

  if (url.startsWith('/stats/users/') && url.endsWith('/merge')) {
    return {
      json: {
        exampleSuggestionMerges: {},
        dialectalVariationMerges: {},
        currentMonthMerges: {},
      },
    };
  }

  if (url.startsWith('/stats/users/') && url.endsWith('/audio')) {
    return {
      json: {
        audioApprovalsCount: 0,
        audioDenialsCount: 0,
      },
    };
  }

  if (url.startsWith('/stats/users/')) {
    return {
      json: {
        approvedWordSuggestionsCount: 0,
        deniedWordSuggestionsCount: 0,
        approvedExampleSuggestionsCount: 0,
        deniedExampleSuggestionsCount: 0,
        authoredWordSuggestionsCount: 0,
        authoredExampleSuggestionsCount: 0,
        mergedWordSuggestionsCount: 0,
        mergedExampleSuggestionsCount: 0,
        mergedByUserWordSuggestionsCount: 0,
        mergedByUserExampleSuggestionsCount: 0,
        currentEditingWordSuggestionsCount: 0,
        currentEditingExampleSuggestionsCount: 0,
      },
    };
  }
  return {
    json: {
      exampleSuggestionMerges: {},
      dialectalVariationMerges: {},
      currentMonthMerges: {},
    },
  };
});
