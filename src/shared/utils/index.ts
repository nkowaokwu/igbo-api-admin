import Collection from '../constants/Collections';
import { getAssociatedExampleSuggestions, getAssociatedWordSuggestions } from '../API';

export const approvalAndDenialsFormatter = (value: string[]): number => value.length;

/* Checks to see if a Word or Example has an associated Suggestion and redirects to it if it exists */
export const determineCreateSuggestionRedirection = async (
  { record, resource, push }:
  { record: Record<any, any>, resource: string, push: (value: any) => void },
): Promise<void> => {
  const suggestionType = resource === Collection.WORDS
    ? Collection.WORD_SUGGESTIONS
    : Collection.EXAMPLE_SUGGESTIONS;
  const prePopulateRecord = {
    ...record,
    ...(resource === Collection.WORDS
      ? { originalWordId: record.id }
      : { originalExampleId: record.id }),
  };

  /**
   * Moves the nested example suggestion's id to originalExampleId
   * to avoid nested example duplication
   */
  if (resource === Collection.WORDS) {
    prePopulateRecord.examples = prePopulateRecord.examples.map((example) => {
      example.originalExampleId = example.id;
      delete example.id;
      return example;
    });
  }

  const associatedSuggestions = await (suggestionType === Collection.WORD_SUGGESTIONS
    ? getAssociatedWordSuggestions(record.id)
    : getAssociatedExampleSuggestions(record.id)
  );
  const suggestionId = associatedSuggestions[0]?.id;
  const isPreExistingSuggestion = !!suggestionId;
  const redirectLink = isPreExistingSuggestion
    ? `/${suggestionType}/${suggestionId}/edit`
    : `/${suggestionType}/create`;
  push({
    pathname: redirectLink,
    state: { record: prePopulateRecord, isPreExistingSuggestion },
  });
};
