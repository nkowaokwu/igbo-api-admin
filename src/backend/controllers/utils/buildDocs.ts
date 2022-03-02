import { assign, map, forEach } from 'lodash';
import accents from 'remove-accents';
import Word from 'src/backend/models/Word';
import * as Interfaces from './interfaces';

/**
 * Removes _id and __v from nested documents
 * Normalizes (removes accent marks) from word and example's igbo
 */
const removeKeysInNestedDoc = (docs: Interfaces.Word[], nestedDocsKey: string): Interfaces.Word[] => {
  forEach(docs, (doc) => {
    // Handles removing accent marks for word
    doc.word = accents.remove(doc.word);
    doc[nestedDocsKey] = map(doc[nestedDocsKey], (nestedDoc) => {
      const updatedNestedDoc = assign(nestedDoc, { id: nestedDoc._id });
      if (nestedDocsKey === 'examples') {
        // Handles remove accent marks for example's igbo
        updatedNestedDoc.igbo = accents.remove(updatedNestedDoc.igbo);
      }
      delete updatedNestedDoc._id;
      delete updatedNestedDoc.__v;
      return updatedNestedDoc;
    });
  });
  return docs;
};

/* Depending on whether or not a search term is provided,
 * the sort by key will be determined */
const determineSorting = (match: any) => {
  if (match.$text) {
    if (match.$text.$search) {
      return { word: { $meta: 'textScore' } };
    }
  } else if (match.word) {
    return { word: 1, _id: 1 };
  }
  return { 'definitions.0': 1 };
};

/* Performs a outer left lookup to append associated examples
 * and returns a plain word object, not a Mongoose Query
 */
export const findWordsWithMatch = async (
  {
    match,
    examples,
    skip = 0,
    limit = 10,
  }:
  {
    match: any,
    examples?: bool,
    skip?: number,
    limit?: number,
  },
): Promise<Interfaces.Word[]> => {
  let words = Word.aggregate()
    .match(match)
    .sort(determineSorting(match));

  if (examples) {
    words = words
      .lookup({
        from: 'examples',
        localField: '_id',
        foreignField: 'associatedWords',
        as: 'examples',
      });
  }
  words = words
    .collation({
      locale: 'ig',
      caseFirst: 'upper',
      alternate: 'shifted',
      maxVariable: 'space',
    })
    .project({
      id: '$_id',
      _id: 0,
      word: 1,
      wordClass: 1,
      definitions: 1,
      variations: 1,
      stems: 1,
      updatedAt: 1,
      dialects: 1,
      isStandardIgbo: 1,
      pronunciation: 1,
      synonyms: 1,
      antonyms: 1,
      hypernyms: 1,
      hyponyms: 1,
      isComplete: 1,
      nsibidi: 1,
      ...(examples ? { examples: 1 } : {}),
    })
    .skip(skip)
    .limit(limit);

  return examples ? removeKeysInNestedDoc(await words, 'examples') : words;
};
