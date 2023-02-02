const userStatBodies = {
  approvedWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"approvals"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total approved word suggestions',
  },
  deniedWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"denials"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total denied word suggestions',
  },
  approvedExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"approvals"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total approved example suggestions',
  },
  deniedExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"denials"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total denied example suggestions',
  },
  authoredWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"authorId"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total authored word suggestions',
  },
  authoredExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"authorId"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total authored exampled suggestions',
  },
  mergedWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"authorId"'
    + '%3Atrue%2C"mergedBy"%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Merged authored word suggestions',
  },
  mergedExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"authorId"'
    + '%3Atrue%2C"mergedBy"%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Merged authored example suggestions',
  },
  mergedByUserWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"merger"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Merged word suggestions',
  },
  mergedByUserExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"merger"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Merged example suggestions',
  },
  currentEditingWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"userInteractions"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total currently editing word suggestions',
  },
  currentEditingExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"userInteractions"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total currently editing example suggestions',
  },
};

export default userStatBodies;
