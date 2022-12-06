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
