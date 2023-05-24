import {
  assign,
  filter,
  map,
  uniqBy,
} from 'lodash';
import { Connection, Document } from 'mongoose';
import { wordSchema } from 'src/backend/models/Word';
import * as Interfaces from '../utils/interfaces';

/* Syncs up relatedTerms links between word documents */
export const handleSyncingSynonyms = async (
  wordDoc: Document<Interfaces.Word> | Interfaces.Word,
  mongooseConnect: Connection,
): Promise<Document<Interfaces.Word>> => {
  const Word = mongooseConnect.model('Word', wordSchema);
  // Remove the current Word document id from other Word document ids
  const wordDocsWithCurrentWord: Document<Interfaces.Word>[] = await Word.find({ relatedTerms: [wordDoc.id] });
  await Promise.all(wordDocsWithCurrentWord.map(async (wordDocWithCurrentWord: Interfaces.Word) => {
    try {
      wordDocWithCurrentWord.relatedTerms = wordDocWithCurrentWord.relatedTerms.filter((relatedTerm) => (
        relatedTerm.toString() !== wordDoc.id.toString()
      ));
      return await wordDocWithCurrentWord.save();
    } catch (err) {
      return null;
    }
  }));

  // Place the current Word document id in other Word document relatedTerms array
  const wordDocsWithoutCurrentWord: Document<Interfaces.Word>[] = (
    await Word.find({ _id: { $in: wordDoc.relatedTerms }, relatedTerms: { $nin: [wordDoc.id] } })
  );
  await Promise.all(wordDocsWithoutCurrentWord.map(async (wordDocWithoutCurrentWord: Interfaces.Word) => {
    try {
      wordDocWithoutCurrentWord.relatedTerms.push(wordDoc.id);
      return await wordDocWithoutCurrentWord.save();
    } catch (err) {
      return null;
    }
  }));
  return wordDoc;
};

/* Syncs up antonyms links between word documents */
export const handleSyncingAntonyms = async (
  wordDoc: Document<Interfaces.Word> | Interfaces.Word,
  mongooseConnect: Connection,
): Promise<Document<Interfaces.Word>> => {
  const Word = mongooseConnect.model('Word', wordSchema);
  // Remove the current Word document id from other Word document ids
  const wordDocsWithCurrentWord: Document<Interfaces.Word>[] = await Word.find({ antonyms: [wordDoc.id] });
  await Promise.all(wordDocsWithCurrentWord.map(async (wordDocWithCurrentWord: Interfaces.Word) => {
    try {
      wordDocWithCurrentWord.antonyms = wordDocWithCurrentWord.antonyms.filter((antonym) => (
        antonym.toString() !== wordDoc.id.toString()
      ));
      return await wordDocWithCurrentWord.save();
    } catch (err) {
      return null;
    }
  }));

  // Place the current Word document id in other Word document antonyms array
  const wordDocsWithoutCurrentWord: Document<Interfaces.Word>[] = (
    await Word.find({ _id: { $in: wordDoc.antonyms }, relatedTerms: { $nin: [wordDoc.id] } })
  );
  await Promise.all(wordDocsWithoutCurrentWord.map(async (wordDocWithoutCurrentWord: Interfaces.Word) => {
    try {
      wordDocWithoutCurrentWord.antonyms.push(wordDoc.id);
      return await wordDocWithoutCurrentWord.save();
    } catch (err) {
      return null;
    }
  }));
  return wordDoc;
};

/**
 * Combines wordToDelete into wordToCombine.
 * @param param0 wordToCombine and wordToDelete
 * @returns updatedWord
 */
export const combineWords = ({
  wordToCombine,
  wordToDelete,
} : {
  wordToCombine: Interfaces.Word,
  wordToDelete: Interfaces.Word,
}): Interfaces.Word => {
  const updatedWord = assign(wordToCombine);
  const {
    pronunciation = '',
    definitions = [],
    stems = [],
    variations = [],
    relatedTerms = [],
    hypernyms = [],
    hyponyms = [],
    nsibidi = '',
    dialects = [],
    tags = [],
  } = wordToDelete;
  updatedWord.pronunciation = updatedWord.pronunciation || pronunciation;
  // @ts-expect-error
  const updatedDefinitions: Interfaces.Word['definitions'] = (
    // @ts-expect-error
    [...updatedWord.definitions].map((definitionGroup) => definitionGroup.toObject())
  );
  definitions.forEach((definitionGroup: Interfaces.DefinitionSchema) => {
    const existingDefinitionGroupIndex = updatedDefinitions
      .findIndex(({ wordClass }) => definitionGroup.wordClass === wordClass);
    if (existingDefinitionGroupIndex !== -1) {
      updatedDefinitions[existingDefinitionGroupIndex] = {
        ...updatedDefinitions[existingDefinitionGroupIndex],
        definitions: Array.from(
          new Set([...updatedDefinitions[existingDefinitionGroupIndex].definitions,
            ...definitionGroup.definitions]),
        ),
      };
    } else {
      updatedDefinitions.push(definitionGroup);
    }
  });
  updatedWord.definitions = updatedDefinitions;
  updatedWord.dialects = Array.from([...updatedWord.dialects, ...(dialects || [])]);
  updatedWord.tags = Array.from(new Set([...updatedWord.tags, ...(tags || [])]));
  updatedWord.variations = Array.from(new Set([...updatedWord.variations, ...variations]));
  updatedWord.stems = Array.from(new Set([...(updatedWord.stems || []), ...(stems || [])]));
  updatedWord.relatedTerms = Array.from(new Set([...updatedWord.relatedTerms, ...relatedTerms]));
  updatedWord.hypernyms = Array.from(new Set([...updatedWord.hypernyms, ...hypernyms]));
  updatedWord.hyponyms = Array.from(new Set([...updatedWord.hyponyms, ...hyponyms]));
  updatedWord.nsibidi = updatedWord.nsibidi || nsibidi;

  return updatedWord;
};

/* Replaces all instances of oldId inside all of the examples with
 * with the newId */
export const replaceWordIdsFromExampleAssociatedWords = (
  examples: Interfaces.Example[],
  oldId: string,
  newId: string,
): Promise<Interfaces.Example[]> => (
  Promise.all(map(examples, (example) => {
    const cleanedWordExample = assign(example);
    cleanedWordExample.associatedWords.push(newId);
    cleanedWordExample.associatedWords = uniqBy(
      filter(cleanedWordExample.associatedWords, (associatedWord) => associatedWord.toString() !== oldId.toString()),
      (associatedWord) => associatedWord.toString(),
    );
    return cleanedWordExample.save();
  }))
);
