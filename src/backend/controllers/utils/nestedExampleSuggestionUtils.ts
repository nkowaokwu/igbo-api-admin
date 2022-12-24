import { Document, LeanDocument } from 'mongoose';
import {
  pick,
  differenceBy,
  get,
  reduce,
  map,
  compact,
  flatten,
} from 'lodash';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { wordSuggestionSchema } from 'src/backend/models/WordSuggestion';
import {
  createExampleSuggestion,
  updateExampleSuggestion,
  removeExampleSuggestion,
} from '../exampleSuggestions';
import * as Interfaces from './interfaces';

/* Adds the example key on each wordSuggestion returned back to the client */
export const placeExampleSuggestionsOnSuggestionDoc = async (
  wordSuggestion: Interfaces.WordSuggestion,
  mongooseConnection: any,
): Promise<LeanDocument<Interfaces.WordSuggestion>> => {
  const LEAN_EXAMPLE_KEYS = [
    'igbo',
    'english',
    'associatedWords',
    'id',
    'authorId',
    'exampleForSuggestion',
    'meaning',
    'nsibidi',
    'pronunciation',
    'originalExampleId',
  ].join(' ');
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
  const examples: Interfaces.ExampleSuggestion[] = await ExampleSuggestion
    .find({ associatedWords: wordSuggestion.id })
    .select(LEAN_EXAMPLE_KEYS);
  return {
    ...wordSuggestion.toObject(),
    examples,
  };
};

/* Picks out the examples key in the data payload */
export const getExamplesFromClientData = (data: Interfaces.WordClientData): Interfaces.ExampleClientData[] => {
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
  { suggestionDoc, clientExamples, mongooseConnection }:
  { suggestionDoc: Interfaces.WordSuggestion, clientExamples: Interfaces.ExampleClientData[], mongooseConnection: any },
): Promise<void> => {
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
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
        && exampleToDelete.associatedWords.includes(suggestionDoc.id.toString())) {
        removeExampleSuggestion(exampleToDelete.id.toString(), mongooseConnection);
      }
    });
  }
};

/**
 * If the nested example sentence does have an id
 * then the platform will update the existing word suggestion
 */
const updateExistingExampleSuggestion = async (example: Interfaces.ExampleClientData, mongooseConnection: any) => {
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
  return ExampleSuggestion.findById(example.id)
    .then((exampleSuggestion) => {
      if (!exampleSuggestion) {
        throw new Error('No example suggestion exists with the provided id.');
      }
      return updateExampleSuggestion({ id: example.id, data: example, mongooseConnection });
    })
    .catch((error) => {
      throw new Error(error.message || 'An error occurred while finding nested example suggestion.');
    });
};

const generateAssociatedWords = async (example: Interfaces.ExampleClientData, suggestionDocId: string): string[] => (
  Array.from(
    new Set(
      // Filters out duplicates
      [...(Array.isArray(example.associatedWords) ? example.associatedWords : []), suggestionDocId],
    ),
  )
);

// eslint-disable-next-line
const generateAssociatedDefinitionsSchemas = async (example: Interfaces.ExampleClientData, mongooseConnection: any): Promise<string[]> => {
  const WordSuggestion = mongooseConnection.model('WordSuggestion', wordSuggestionSchema);
  let associatedDefinitionsSchemas: string[] = [];
  if (
    (!example.associatedDefinitionsSchemas || !example.associatedDefinitionsSchemas.length)
    && example.associatedWords[0]
  ) {
    // If we have no associated definitions schemas but an associated word, let's set the default value
    const associatedWordSuggestion = await WordSuggestion.findById(example.associatedWords[0]);
    const definitionSchemaId = (get(associatedWordSuggestion, 'definitions[0]._id') || '').toString();
    associatedDefinitionsSchemas = [definitionSchemaId];
  } else {
    associatedDefinitionsSchemas = example.associatedDefinitionsSchemas;
  }
  return compact(flatten(associatedDefinitionsSchemas));
};

/**
 * Handles either creating or updating nested Example Suggestions within
 * a Word Suggestion
 * @returns Example Suggestion documents
 */
export const updateNestedExampleSuggestions = (
  {
    suggestionDocId,
    clientExamples,
    mongooseConnection,
    user,
  }:
  {
    suggestionDocId: string,
    clientExamples: Interfaces.ExampleClientData[],
    mongooseConnection: any,
    user: { uid: string },
  },
): Promise<Interfaces.ExampleSuggestion[]> => (
  Promise.all(map(clientExamples, async (example) => {
    /**
     * If the nested example client data doesn\'t have an
     * id then a brand new Example Suggestion will be created
     * for the Word Suggestion
     */
    if (!example.id) {
      const exampleData = {
        ...example,
        authorId: user.uid,
        exampleForSuggestion: true,
        associatedWords: await generateAssociatedWords(example, suggestionDocId),
        // associatedDefinitionsSchemas: await generateAssociatedDefinitionsSchemas(example),
      };
      const exampleSuggestion = await createExampleSuggestion(exampleData, mongooseConnection);
      return exampleSuggestion;
    }
    return updateExistingExampleSuggestion(example, mongooseConnection);
  }))
);
