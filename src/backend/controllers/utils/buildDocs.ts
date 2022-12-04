import { assign, map, forEach } from 'lodash';
import accents from 'remove-accents';
import Corpus from 'src/backend/models/Corpus';
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

/* Performs a outer left lookup to append associated examples
 * and returns a plain word object, not a Mongoose Query
 */
export const findWordsWithMatch = async (
  {
    match,
    examples,
    skip = 0,
    limit = 10,
    Word,
  }:
  {
    match: any,
    examples?: boolean,
    skip?: number,
    limit?: number,
    Word: any,
  },
): Promise<Interfaces.Word[]> => {
  let words = Word.aggregate()
    .match(match);

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
    .project({
      id: '$_id',
      _id: 0,
      word: 1,
      wordPronunciation: 1,
      conceptualWord: 1,
      definitions: 1,
      variations: 1,
      stems: 1,
      updatedAt: 1,
      dialects: 1,
      attributes: 1,
      pronunciation: 1,
      relatedTerms: 1,
      hypernyms: 1,
      hyponyms: 1,
      nsibidi: 1,
      tags: 1,
      tenses: 1,
      source: 1,
      ...(examples ? { examples: 1 } : {}),
    })
    .skip(skip)
    .limit(limit);

  return examples ? removeKeysInNestedDoc(await words, 'examples') : words;
};

/* Performs a outer left lookup to append associated examples
 * and returns a plain corpus object, not a Mongoose Query
 */
export const findCorporaWithMatch = async (
  {
    match,
    skip = 0,
    limit = 10,
  }:
  {
    match: any,
    skip?: number,
    limit?: number,
  },
): Promise<Interfaces.Corpus[]> => {
  let corpora = Corpus.aggregate()
    .match(match);

  corpora = corpora
    .project({
      id: '$_id',
      _id: 0,
      title: 1,
      body: 1,
      media: 1,
      tags: 1,
      duration: 1,
    })
    .skip(skip)
    .limit(limit);

  return corpora;
};
