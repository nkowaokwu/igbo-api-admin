import { Connection, Document, LeanDocument } from 'mongoose';
import {
  assign,
  filter,
  pick,
  differenceBy,
  reduce,
  map,
} from 'lodash';
import { exampleSchema } from 'src/backend/models/Example';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { executeMergeExample } from 'src/backend/controllers/examples';
import {
  createExampleSuggestion,
  updateExampleSuggestion,
  removeExampleSuggestion,
} from '../exampleSuggestions';
import * as Interfaces from './interfaces';

/* Adds the example key on each wordSuggestion returned back to the client */
export const placeExampleSuggestionsOnSuggestionDoc = async (
  wordSuggestion: Interfaces.WordSuggestion,
  mongooseConnection: Connection,
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
// const generateAssociatedDefinitionsSchemas = async (example: Interfaces.ExampleClientData, mongooseConnection: any): Promise<string[]> => {
//   const WordSuggestion = mongooseConnection.model('WordSuggestion', wordSuggestionSchema);
//   let associatedDefinitionsSchemas: string[] = [];
//   if (
//     (!example.associatedDefinitionsSchemas || !example.associatedDefinitionsSchemas.length)
//     && example.associatedWords[0]
//   ) {
//     // If we have no associated definitions schemas but an associated word, let's set the default value
//     const associatedWordSuggestion = await WordSuggestion.findById(example.associatedWords[0]);
//     const definitionSchemaId = (get(associatedWordSuggestion, 'definitions[0]._id') || '').toString();
//     associatedDefinitionsSchemas = [definitionSchemaId];
//   } else {
//     associatedDefinitionsSchemas = example.associatedDefinitionsSchemas;
//   }
//   return compact(flatten(associatedDefinitionsSchemas));
// };

/**
 * Archives example sentences that should be "deleted"
 * @param param0
 */
const archiveExamples = async (
  {
    exampleIds,
    mongooseConnection,
  }
  : {
    exampleIds: string[],
    mongooseConnection: Connection,
  },
): Promise<void> => {
  const Example = mongooseConnection.model('Example', exampleSchema);
  await Promise.all(exampleIds.map(async (exampleId) => {
    const archivedExample = await Example.findById(exampleId);
    archivedExample.archived = true;
    archivedExample.markModified('archived');
    await archivedExample.save();
  }));
};

/**
 * Generates an object where the keys are the existing example suggestions
 * for the associated word suggestion
 * @param { wordSuggestionId, mongooseConnection }
 * @returns An object of example suggestion ids as keys
 */
const generateExistingExampleSuggestionsObject = async ({
  wordSuggestionId,
  mongooseConnection,
} : {
  wordSuggestionId: string,
  mongooseConnection: Connection
}) => {
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
  const nestedExampleSuggestions: Interfaces.ExampleSuggestion[] = await ExampleSuggestion
    .find({ associatedWords: wordSuggestionId });
  const existingExampleSuggestionIds = nestedExampleSuggestions.reduce((nestedExampleSuggestionIdsObject, { id }) => ({
    ...nestedExampleSuggestionIdsObject,
    [id.toString()]: true,
  }), {});
  return existingExampleSuggestionIds;
};

export const assignExampleSuggestionToExampleData = async ({
  wordSuggestion,
  originalWord,
  mergedBy,
  mongooseConnection,
} : {
  wordSuggestion: Interfaces.WordSuggestion,
  originalWord: Interfaces.Word,
  mergedBy: string,
  mongooseConnection: Connection,
}): Promise<void> => {
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
  const Example = mongooseConnection.model('Example', exampleSchema);

  // Archiving examples
  // 1. Get all word suggestion' nested example suggestions
  const exampleSuggestions: Interfaces.ExampleSuggestion[] = (
    await ExampleSuggestion.find({ associatedWords: wordSuggestion.id.toString() })
  );
  // 2. Get all word's nested examples
  const examples: Interfaces.Example[] = (
    await Example.find({ associatedWords: originalWord.id.toString() })
  );
  // 3. Determine which word examples are not going to be updated
  const uneditedExamples = examples.filter(({ id }) => (
    !exampleSuggestions.find(({ originalExampleId }) => originalExampleId?.toString?.() === id.toString())
  ));
  const archivingExampleIds = uneditedExamples.map(({ id }) => id?.toString?.());
  console.log('Archiving the following examples:', archivingExampleIds);
  // 4. Archive all non-updated examples
  if (archivingExampleIds.length) {
    await archiveExamples({ exampleIds: archivingExampleIds, mongooseConnection });
  }

  await Promise.all(map(exampleSuggestions, async (exampleSuggestion: Interfaces.ExampleSuggestion) => {
    const removeSuggestionAssociatedIds: Interfaces.ExampleSuggestion = assign(exampleSuggestion);
    /* Before creating new Example from ExampleSuggestion,
     * all associated word suggestion ids must be removed
     */
    removeSuggestionAssociatedIds.associatedWords = filter(
      exampleSuggestion.associatedWords,
      (associatedWord) => associatedWord.toString() !== wordSuggestion.id.toString(),
    );
    if (!removeSuggestionAssociatedIds.associatedWords.includes(originalWord.id.toString())) {
      removeSuggestionAssociatedIds.associatedWords.push(originalWord.id.toString());
    }
    /* Before creating new Example from ExampleSuggestion,
     * all associated definitions schema ids must be removed
     */
    // removeSuggestionAssociatedIds.associatedDefinitionsSchemas = filter(
    //   exampleSuggestion.associatedDefinitionsSchemas,
    //   (associatedDefinitionSchema) => (
    // !find(wordSuggestion.definitions, (({ _id: wordSuggestionDefinitionSchemaId }) => (
    //     wordSuggestionDefinitionSchemaId.toString() === associatedDefinitionSchema.toString())
    //   )),
    // );
    // const lookForDefinitionSchemaInOriginalDoc = (definitionSchemaId: string) => (
    //   // Look for a original document definitions schema that has the current associated definitions Schema
    //   find(originalWord.definitions, (({ _id }) => _id.toString() === definitionSchemaId))
    // );
    // removeSuggestionAssociatedIds.associatedDefinitionsSchemas.forEach((associatedDefinitionsSchema) => {
    //   const originalDocDefinitionSchemaId = lookForDefinitionSchemaInOriginalDoc(associatedDefinitionsSchema);
    //   if (originalDocDefinitionSchemaId?._id) {
    //     removeSuggestionAssociatedIds.associatedDefinitionsSchemas
    //       .push(originalDocDefinitionSchemaId._id.toString());
    //   }
    // });
    const updatedExampleSuggestion = await removeSuggestionAssociatedIds.save();
    return executeMergeExample(updatedExampleSuggestion, mergedBy, mongooseConnection);
  }));
};

/**
 * For all the example suggestions that weren't updated in the payload,
 * they will be removed from the associated word suggestion
 */
const deleteUneditedExampleSuggestions = async ({
  existingExampleSuggestionIds,
  mongooseConnection,
} : {
  existingExampleSuggestionIds: { [key: string]: boolean },
  mongooseConnection: Connection,
}): Promise<void> => {
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
  await Promise.all(Object.keys(existingExampleSuggestionIds).map(((id) => ExampleSuggestion.findByIdAndRemove(id))));
};

/**
 * Handles either creating or updating nested Example Suggestions within
 * a Word Suggestion
 * @returns Example Suggestion documents
 */
export const updateNestedExampleSuggestions = async (
  {
    suggestionDocId,
    clientExamples,
    mongooseConnection,
    user,
  }:
  {
    suggestionDocId: string,
    clientExamples: Interfaces.ExampleClientData[],
    mongooseConnection: Connection,
    user: { uid: string },
  },
): Promise<Interfaces.ExampleSuggestion[]> => {
  const existingExampleSuggestionIds = await generateExistingExampleSuggestionsObject({
    wordSuggestionId: suggestionDocId,
    mongooseConnection,
  });
  const updatedExampleSuggestions = Promise.all(map(clientExamples, async (example) => {
    /**
     * If the nested example client data doesn\'t have an
     * id then a brand new Example Suggestion will be created
     * for the Word Suggestion
     */
    if (!example.id) {
      const exampleData = {
        ...example,
        // If the example suggestion has an originalExampleId then it's not brand new and should
        // not be considered as such by attributing the user.uid as the author
        authorId: !example.originalExampleId ? user.uid : null,
        exampleForSuggestion: true,
        associatedWords: await generateAssociatedWords(example, suggestionDocId),
        // associatedDefinitionsSchemas: await generateAssociatedDefinitionsSchemas(example),
      };
      const exampleSuggestion = await createExampleSuggestion(exampleData, mongooseConnection);
      return exampleSuggestion;
    }
    delete existingExampleSuggestionIds[example.id];
    return updateExistingExampleSuggestion(example, mongooseConnection);
  }));

  await deleteUneditedExampleSuggestions({ existingExampleSuggestionIds, mongooseConnection });
  return updatedExampleSuggestions;
};
