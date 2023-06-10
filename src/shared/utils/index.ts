import { compact } from 'lodash';
import Collection from '../constants/Collections';
import {
  getAssociatedExampleSuggestions,
  getAssociatedWordSuggestions,
  getAssociatedWordSuggestionByTwitterId,
} from '../API';

export const approvalAndDenialsFormatter = (value: string[]): number => value.length;

/* Checks to see if a Word or Example has an associated Suggestion and redirects to it if it exists */
export const determineCreateSuggestionRedirection = async (
  { record, resource, push }:
  { record: {
    id: string,
    word: string,
    attributes: {
      isConstructedTerm: boolean,
    },
    twitterPollId?: string,
    examples: any[],
  }, resource: string, push: (value: any) => void },
): Promise<void> => {
  const suggestionType = resource === Collection.WORDS
    ? Collection.WORD_SUGGESTIONS
    : resource === Collection.POLLS
      ? Collection.POLLS
      : resource === Collection.CORPORA
        ? Collection.CORPUS_SUGGESTIONS
        : resource === Collection.NSIBIDI_CHARACTERS
          ? Collection.NSIBIDI_CHARACTERS
          : Collection.EXAMPLE_SUGGESTIONS;
  const prePopulateRecord = {
    ...record,
    ...(resource === Collection.WORDS
      ? { originalWordId: record.id }
      : resource === Collection.EXAMPLES
        ? { originalExampleId: record.id }
        : resource === Collection.NSIBIDI_CHARACTERS
          ? { id: record.id }
          : { originalCorpusId: record.id }),
  };

  /**
   * Moves the nested example suggestion's id to originalExampleId
   * to avoid nested example duplication
   *
   * Filter out archived example suggestions
   */
  if (resource === Collection.WORDS) {
    prePopulateRecord.examples = compact(prePopulateRecord.examples.map((example) => {
      if (example.archived) {
        return null;
      }
      example.originalExampleId = example.id;
      delete example.id;
      return example;
    }));
  }

  const associatedSuggestions = await (suggestionType === Collection.WORD_SUGGESTIONS
    ? getAssociatedWordSuggestions(record.id)
    : suggestionType === Collection.POLLS
      ? getAssociatedWordSuggestionByTwitterId(record?.twitterPollId)
      : suggestionType === Collection.NSIBIDI_CHARACTERS
        ? []
        : getAssociatedExampleSuggestions(record.id)
  );
  const finalResource = suggestionType === Collection.WORD_SUGGESTIONS || suggestionType === Collection.POLLS
    ? Collection.WORD_SUGGESTIONS
    : suggestionType === Collection.CORPUS_SUGGESTIONS
      ? Collection.CORPUS_SUGGESTIONS
      : suggestionType === Collection.NSIBIDI_CHARACTERS
        ? Collection.NSIBIDI_CHARACTERS
        : Collection.EXAMPLE_SUGGESTIONS;
  const suggestionId = associatedSuggestions[0]?.id || (resource === Collection.NSIBIDI_CHARACTERS && record.id);
  const isPreExistingSuggestion = !!suggestionId || (record.id && resource === Collection.NSIBIDI_CHARACTERS);

  const redirectLink = isPreExistingSuggestion
    ? `/${finalResource}/${suggestionId}/edit`
    : `/${finalResource}/create`;
  push({
    pathname: redirectLink,
    state: { record: prePopulateRecord, isPreExistingSuggestion },
  });
};
