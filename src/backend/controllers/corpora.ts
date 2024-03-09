import mongoose, { Connection, Document, LeanDocument } from 'mongoose';
import { Response, NextFunction } from 'express';
import { assign, omit } from 'lodash';
import { corpusSchema } from 'src/backend/models/Corpus';
import { corpusSuggestionSchema } from 'src/backend/models/CorpusSuggestion';
import { renameMedia } from 'src/backend/controllers/utils/MediaAPIs/CorpusMediaAPI';
import { sortDocsBy, packageResponse, handleQueries, updateDocumentMerge } from './utils';
import * as Interfaces from './utils/interfaces';
import { findCorporaWithMatch } from './utils/buildDocs';
import { searchCorpusTextSearch } from './utils/queries';

/* Searches for a corpus within MongoDB */
const searchCorpus = async ({
  query,
  searchWord,
  mongooseConnection,
  ...rest
}: {
  query: any;
  searchWord: string;
  mongooseConnection: Connection;
}): Promise<Interfaces.Word[]> => {
  const Corpus = mongooseConnection.model('Corpus', corpusSchema);
  const corpora: Interfaces.Word[] = await findCorporaWithMatch({ match: query, Corpus, ...rest });
  ({ match: query, ...rest });
  return sortDocsBy(searchWord, corpora, 'title');
};

/* Gets corpora from MongoDB */
export const getCorpora = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.Corpus> | void> => {
  try {
    const { searchWord, regexKeyword, skip, limit, strict, filters, user, mongooseConnection, ...rest } =
      handleQueries(req);
    const searchQueries = {
      searchWord,
      skip,
      limit,
      dialects: true,
      examples: true,
    };
    const Corpus = mongooseConnection.model('Corpus', corpusSchema);

    const query = searchCorpusTextSearch(searchWord, regexKeyword);
    const corpora = await searchCorpus({ query, mongooseConnection, ...searchQueries });
    return await packageResponse<Interfaces.Corpus>({
      res,
      docs: corpora,
      model: Corpus,
      query,
      ...rest,
    });
  } catch (err) {
    return next(err);
  }
};

/* Returns a corpus from MongoDB using an id */
export const getCorpus = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const Corpus = mongooseConnection.model('Corpus', corpusSchema);

    const updatedCorpus = await findCorporaWithMatch({
      match: { _id: new mongoose.Types.ObjectId(id) },
      limit: 1,
      Corpus,
    }).then(async ([corpus]: Interfaces.Corpus[]) => {
      if (!corpus) {
        throw new Error('No corpus exists with the provided id.');
      }
      return corpus;
    });
    return res.send(updatedCorpus);
  } catch (err) {
    return next(err);
  }
};

const findAndUpdateCorpus = (
  id: string,
  mongooseConnection: Connection,
  cb: (any) => Interfaces.Corpus,
): Promise<Interfaces.Corpus> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(!id ? 'No corpus id provided' : 'Invalid corpus id provided');
  }
  const Corpus = mongooseConnection.model('Corpus', corpusSchema);

  return Corpus.findById(id).then(async (corpus: Interfaces.Corpus) => {
    if (!corpus) {
      throw new Error("Corpus doesn't exist");
    }
    return cb(assign(corpus));
  });
};

/* Updates a Corpus document in the database */
export const putCorpus = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const {
      body: data,
      params: { id },
      mongooseConnection,
    } = req;
    const savedCorpus: Interfaces.Corpus = await findAndUpdateCorpus(id, mongooseConnection, (corpus) => {
      const updatedCorpus = assign(corpus, data);
      return updatedCorpus.save();
    });
    return res.send(savedCorpus);
  } catch (err) {
    return next(err);
  }
};

/* Takes the suggestion corpus media and overwrites the existing Corpus document's media file */
const overwriteCorpusPronunciation = async (
  corpusSuggestion: Interfaces.CorpusSuggestion,
  corpus: Interfaces.Corpus,
  mongooseConnection: Connection,
): Promise<Document<Interfaces.Corpus>> => {
  const Corpus = mongooseConnection.model('Corpus', corpusSchema);
  const CorpusSuggestion = mongooseConnection.model('CorpusSuggestion', corpusSuggestionSchema);
  try {
    /**
     * Creating AWS URI for corpus media
     * If the corpusSuggestion doesn't have a media, then an empty string
     * will be passed in to tell AWS to delete the audio record for the associated
     * Corpus document
     */
    const suggestionDocId = corpusSuggestion.media ? corpusSuggestion.id.toString() : '';
    const finalMediaUri = await renameMedia(suggestionDocId, corpus.id.toString());

    corpusSuggestion.media = finalMediaUri;
    corpus.media = finalMediaUri;

    // Since the corpus suggestion is no longer needed, we don't need to trigger any AudioAPI.ts functions
    corpusSuggestion.skipPronunciationHook = true;
    await corpusSuggestion.save();
    await CorpusSuggestion.findOneAndUpdate({ _id: corpusSuggestion.id }, corpusSuggestion.toObject());
    await Corpus.findOneAndUpdate({ _id: corpus.id }, corpus.toObject());
    const savedCorpus = await corpus.save();
    return savedCorpus;
  } catch (err) {
    // console.log('An error while merging media failed:', err.message);
    // console.log('Deleting the associated corpus document to avoid producing duplicates');
    await corpus.delete();
    throw err;
  }
};

/* Merges new data into an existing Corpus document */
const mergeIntoCorpus = (
  suggestionDoc: Interfaces.CorpusSuggestion,
  mergedBy: string,
  mongooseConnection: Connection,
): Promise<Interfaces.Corpus | void> => {
  const Corpus = mongooseConnection.model('Corpus', corpusSchema);

  const suggestionDocObject: Interfaces.CorpusSuggestion | any = suggestionDoc.toObject();
  return Corpus.findOneAndUpdate(
    { _id: suggestionDocObject.originalCorpusId },
    { $set: omit(suggestionDocObject, ['media']) },
    { new: true },
  )
    .then(async (updatedCorpus: Interfaces.Corpus) => {
      if (!updatedCorpus) {
        throw new Error("Corpus doesn't exist");
      }

      await overwriteCorpusPronunciation(suggestionDoc, updatedCorpus, mongooseConnection);
      await updateDocumentMerge(suggestionDoc, suggestionDocObject.originalCorpusId, mergedBy);
      return updatedCorpus;
    })
    .catch((error) => {
      throw new Error(error.message);
    });
};

/* Creates Corpus documents in MongoDB database */
export const createCorpus = async (
  data:
    | Interfaces.CorpusClientData
    | Interfaces.CorpusSuggestion
    | LeanDocument<Document<Interfaces.CorpusClientData | Interfaces.CorpusSuggestion>>,
  mongooseConnection: Connection,
): Promise<Document<Interfaces.Corpus>> => {
  const Corpus = mongooseConnection.model('Corpus', corpusSchema);

  const newCorpus: Document<Interfaces.Corpus> | any = new Corpus(data);
  return newCorpus.save();
};

/* Creates a new Corpus document from an existing CorpusSuggestion document */
const createCorpusFromSuggestion = (
  corpusSuggestion: Interfaces.CorpusSuggestion,
  mergedBy: string,
  mongooseConnection: Connection,
): Promise<Document<Interfaces.Corpus> | void> =>
  createCorpus(corpusSuggestion.toObject(), mongooseConnection)
    .then(async (corpus: Document<Interfaces.Corpus>) => {
      const updatedPronunciationsWord = await overwriteCorpusPronunciation(
        corpusSuggestion,
        corpus as Interfaces.Corpus,
        mongooseConnection,
      );
      await updateDocumentMerge(corpusSuggestion, corpus.id, mergedBy);
      return updatedPronunciationsWord;
    })
    .catch((err) => {
      throw new Error(`An error occurred while saving the new corpus: ${err.message}`);
    });

/* Merges the existing CorpusSuggestion into either a brand
 * new Corpus document or merges into an existing Corpus document */
export const mergeCorpus = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { user, mongooseConnection } = req;
    const suggestionDoc = req.suggestionDoc as Interfaces.CorpusSuggestion;

    const mergedCorpus: Document<Interfaces.Corpus> | any =
      (suggestionDoc.originalCorpusId
        ? await mergeIntoCorpus(suggestionDoc, user.uid, mongooseConnection)
        : await createCorpusFromSuggestion(suggestionDoc, user.uid, mongooseConnection)) || {};
    return res.send(mergedCorpus);
  } catch (err) {
    return next(err);
  }
};
