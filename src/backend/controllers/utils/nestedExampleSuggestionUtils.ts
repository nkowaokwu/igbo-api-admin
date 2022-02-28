import { Document } from 'mongoose';
import {
  pick,
  differenceBy,
  reduce,
  map,
} from 'lodash';
import ExampleSuggestion from 'src/backend/models/ExampleSuggestion';
import {
  createExampleSuggestion,
  updateExampleSuggestion,
  removeExampleSuggestion,
} from '../exampleSuggestions';
import * as Interfaces from './interfaces';

/* Adds the example key on each wordSuggestion returned back to the client */
export const placeExampleSuggestionsOnSuggestionDoc = async (
  wordSuggestion: Interfaces.WordSuggestion,
): Promise<Interfaces.WordSuggestion> => {
  const LEAN_EXAMPLE_KEYS = [
    'igbo',
    'english',
    'associatedWords',
    'id',
    'exampleForSuggestion',
    'pronunciation',
    'originalExampleId',
  ].join(' ');
  const examples: Interfaces.ExampleSuggestion[] = await ExampleSuggestion
    .find({ associatedWords: wordSuggestion.id })
    .select(LEAN_EXAMPLE_KEYS);
  return { ...wordSuggestion.toObject(), examples };
};

/* Picks out the examples key in the data payload */
export const getExamplesFromClientData = (data: Interfaces.WordClientData): Interfaces.Example[] => {
  const examples = (pick(data, ['examples']) || {}).examples || [];
  /* Removes originalExampleId if it's an empty string */
  return reduce(examples, (cleanedExamples, example) => {
    const cleanedExample = { ...example };
    if (!cleanedExample.originalExampleId) {
      delete cleanedExample.originalExampleId;
    }
    cleanedExample.authorId = data.authorId;
    return [...cleanedExamples, cleanedExample];
  }, []);
};

/* Either deletes exampleSuggestion or updates exampleSuggestion associatedWords */
export const handleDeletingExampleSuggestions = async (
  { suggestionDoc, clientExamples }:
  { suggestionDoc: Interfaces.WordSuggestion, clientExamples: Interfaces.ExampleClientData[] },
): Promise<void> => {
  const examples: Document<Interfaces.ExampleSuggestion>[] = (
    await ExampleSuggestion.find({ associatedWords: suggestionDoc.id })
  );
  /* An example on the client side has been removed */
  if (examples.length > clientExamples.length) {
    const examplesToDelete = differenceBy(examples, clientExamples, 'id');
    /* Steps through all examples to either delete exampleSuggestion or
     * updates the associatedWords list of an existing exampleSuggestion
     */
    map(examplesToDelete, (exampleToDelete: Interfaces.ExampleSuggestion) => {
      const LAST_ASSOCIATED_WORD = 1;
      /* Deletes example if there's only one last associated word */
      if (exampleToDelete.associatedWords.length <= LAST_ASSOCIATED_WORD
        && exampleToDelete.associatedWords.includes(suggestionDoc.id)) {
        removeExampleSuggestion(exampleToDelete.id);
      }
    });
  }
};

/* Handles either creating or updating nested example suggestions */
export const updateNestedExampleSuggestions = (
  { suggestionDocId, clientExamples }:
  { suggestionDocId: string, clientExamples: Interfaces.ExampleSuggestion[] },
): Promise<Interfaces.ExampleSuggestion[]> => (
  /* Updates all the word's children exampleSuggestions */
  Promise.all(map(clientExamples, (example) => (
    !example.id
    // If the nested example sentence doesn't have an id
    // then a brand new example suggestion needs to be created
    // for the current word suggestion
      ? createExampleSuggestion({
        ...example,
        exampleForSuggestion: true,
        associatedWords: Array.from(
          new Set( // Filters out duplicates
            [...(Array.isArray(example.associatedWords) ? example.associatedWords : []), suggestionDocId],
          ),
        ),
      }) : (async () => (
        // If the nested example sentence does have an id
        // then the platform will update the existing word suggestion
        ExampleSuggestion.findById(example.id)
          .then((exampleSuggestion) => {
            if (!exampleSuggestion) {
              throw new Error('No example suggestion exists with the provided id.');
            }
            return updateExampleSuggestion({ id: example.id, data: example });
          })
          .catch((error) => {
            throw new Error(error.message || 'An error occurred while finding nested example suggestion.');
          })
      ))()
  )))
);
