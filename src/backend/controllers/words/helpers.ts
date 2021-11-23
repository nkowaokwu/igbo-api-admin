import { Document } from 'mongoose';
import Word from '../../models/Word';
import * as Interfaces from '../utils/interfaces';
/* Syncs up synonym links between word documents */
export const handleSyncingSynonyms = async (
  wordDoc: Document<Interfaces.Word> | Interfaces.Word,
): Promise<Interfaces.Word | void> => {
  // Remove the current Word document id from other Word document ids
  const wordDocsWithCurrentWord: Document<Interfaces.Word>[] = await Word.find({ synonyms: [wordDoc.id] });
  await Promise.all(wordDocsWithCurrentWord.map(async (wordDocWithCurrentWord: Interfaces.Word) => {
    try {
      wordDocWithCurrentWord.synonyms = wordDocWithCurrentWord.synonyms.filter((synonym) => (
        synonym.toString() !== wordDoc.id.toString()
      ));
      return wordDocWithCurrentWord.save();
    } catch (err) {
      return null;
    }
  }));

  // Place the current Word document id in other Word document synonyms array
  const wordDocsWithoutCurrentWord: Document<Interfaces.Word>[] = (
    await Word.find({ _id: { $in: wordDoc.synonyms }, synonyms: { $nin: [wordDoc.id] } })
  );
  await Promise.all(wordDocsWithoutCurrentWord.map(async (wordDocWithoutCurrentWord: Interfaces.Word) => {
    try {
      wordDocWithoutCurrentWord.synonyms.push(wordDoc.id);
      return wordDocWithoutCurrentWord.save();
    } catch (err) {
      return null;
    }
  }));
};
