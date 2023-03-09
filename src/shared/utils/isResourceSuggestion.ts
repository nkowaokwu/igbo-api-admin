import Collections from '../constants/Collections';

export default (resource: Collections): boolean => (
  resource === Collections.WORD_SUGGESTIONS
  || resource === Collections.EXAMPLE_SUGGESTIONS
  || resource === Collections.CORPUS_SUGGESTIONS
);
