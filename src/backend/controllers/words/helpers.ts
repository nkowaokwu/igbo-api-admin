import { Document } from 'mongoose';
import Word from 'src/backend/models/Word';
import * as Interfaces from '../utils/interfaces';

/* Syncs up synonym links between word documents */
export const handleSyncingSynonyms = async (
  wordDoc: Document<Interfaces.Word> | Interfaces.Word,
): Promise<Document<Interfaces.Word>> => {
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
  return wordDoc;
};

/* Syncs up antonyms links between word documents */
export const handleSyncingAntonyms = async (
  wordDoc: Document<Interfaces.Word> | Interfaces.Word,
): Promise<Document<Interfaces.Word>> => {
  // Remove the current Word document id from other Word document ids
  const wordDocsWithCurrentWord: Document<Interfaces.Word>[] = await Word.find({ antonyms: [wordDoc.id] });
  await Promise.all(wordDocsWithCurrentWord.map(async (wordDocWithCurrentWord: Interfaces.Word) => {
    try {
      wordDocWithCurrentWord.antonyms = wordDocWithCurrentWord.antonyms.filter((antonym) => (
        antonym.toString() !== wordDoc.id.toString()
      ));
      return wordDocWithCurrentWord.save();
    } catch (err) {
      return null;
    }
  }));

  // Place the current Word document id in other Word document antonyms array
  const wordDocsWithoutCurrentWord: Document<Interfaces.Word>[] = (
    await Word.find({ _id: { $in: wordDoc.antonyms }, synonyms: { $nin: [wordDoc.id] } })
  );
  await Promise.all(wordDocsWithoutCurrentWord.map(async (wordDocWithoutCurrentWord: Interfaces.Word) => {
    try {
      wordDocWithoutCurrentWord.antonyms.push(wordDoc.id);
      return wordDocWithoutCurrentWord.save();
    } catch (err) {
      return null;
    }
  }));
  return wordDoc;
};
