import mongoose, { Document, LeanDocument } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { assign, omit } from 'lodash';
import Corpus from 'src/backend/models/Corpus';
import CorpusSuggestion from 'src/backend/models/CorpusSuggestion';
import { renameMedia } from 'src/backend/controllers/utils/MediaAPIs/CorpusMediaAPI';
import {
  sortDocsBy,
  packageResponse,
  handleQueries,
  updateDocumentMerge,
} from './utils';
import * as Interfaces from './utils/interfaces';
import { findCorporaWithMatch } from './utils/buildDocs';
import { searchCorpusTextSearch } from './utils/queries';

/* Searches for a corpus within MongoDB */
export const searchCorpus = async (
  { query, searchWord, ...rest }:
  { query: any, searchWord: string },
): Promise<Interfaces.Word[]> => {
  const words: Interfaces.Word[] = await findCorporaWithMatch({ match: query, ...rest });
  ({ match: query, ...rest });
  return sortDocsBy(searchWord, words, 'title');
};

/* Gets corpora from MongoDB */
export const getCorpora = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const {
      searchWord,
      regexKeyword,
      range,
      skip,
      limit,
      strict,
      dialects,
      filters,
      user,
      ...rest
    } = handleQueries(req);
    const searchQueries = {
      searchWord,
      skip,
      limit,
      dialects,
      examples: true,
    };
    const query = searchCorpusTextSearch(searchWord, regexKeyword);
    const corpora = await searchCorpus({ query, ...searchQueries });
    return await packageResponse({
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
export const getCorpus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const updatedCorpus = await findCorporaWithMatch({
      match: { _id: mongoose.Types.ObjectId(id) },
      limit: 1,
    })
      .then(async ([corpus]: Interfaces.Corpus[]) => {
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

const findAndUpdateCorpus = (id: string, cb: (any) => Interfaces.Corpus): Promise<Interfaces.Corpus> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(!id ? 'No corpus id provided' : 'Invalid corpus id provided');
  }

  return Corpus.findById(id)
    .then(async (corpus: Interfaces.Corpus) => {
      if (!corpus) {
        throw new Error('Corpus doesn\'t exist');
      }
      return cb(assign(corpus));
    });
};

/* Updates a Corpus document in the database */
export const putCorpus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { body: data, params: { id } } = req;
    const savedCorpus: Interfaces.Corpus = await findAndUpdateCorpus(id, (corpus) => {
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
  suggestion: Interfaces.CorpusSuggestion,
  corpus: Interfaces.Corpus,
): Promise<Document<Interfaces.Corpus>> => {
  try {
    /**
     * Creating AWS URI for corpus media
     * If the suggestion doesn't have a media, then an empty string
     * will be passed in to tell AWS to delete the audio record for the associated
     * Corpus document
     */
    const suggestionDocId = suggestion.media ? suggestion.id.toString() : '';
    const finalMediaUri = await renameMedia(suggestionDocId, corpus.id.toString());

    suggestion.media = finalMediaUri;
    corpus.media = finalMediaUri;

    // Since the corpus suggestion is no longer needed, we don't need to trigger any AudioAPI.ts functions
    suggestion.skipPronunciationHook = true;
    await suggestion.save();
    await CorpusSuggestion.findOneAndUpdate({ _id: suggestion.id }, suggestion.toObject());
    await Corpus.findOneAndUpdate({ _id: corpus.id }, corpus.toObject());
    const savedCorpus = await corpus.save();
    return savedCorpus;
  } catch (err) {
    console.log('An error while merging media failed:', err.message);
    console.log('Deleting the associated corpus document to avoid producing duplicates');
    await corpus.delete();
    throw err;
  }
};

/* Merges new data into an existing Corpus document */
const mergeIntoCorpus = (
  suggestionDoc: Interfaces.CorpusSuggestion,
  mergedBy: string,
): Promise<Interfaces.Corpus | void> => {
  const suggestionDocObject: Interfaces.CorpusSuggestion | any = suggestionDoc.toObject();
  return Corpus.findOneAndUpdate(
    { _id: suggestionDocObject.originalCorpusId },
    { $set: omit(suggestionDocObject, ['media']) },
    { new: true },
  )
    .then(async (updatedCorpus: Interfaces.Corpus) => {
      if (!updatedCorpus) {
        throw new Error('Corpus doesn\'t exist');
      }

      await overwriteCorpusPronunciation(suggestionDoc, updatedCorpus);
      await updateDocumentMerge(suggestionDoc, suggestionDocObject.originalCorpusId, mergedBy);
      return updatedCorpus;
    })
    .catch((error) => {
      throw new Error(error.message);
    });
};

/* Creates Corpus documents in MongoDB database */
export const createCorpus = async (
  data: (
    Interfaces.CorpusClientData
    | Interfaces.CorpusSuggestion
    | LeanDocument<Document<Interfaces.CorpusClientData | Interfaces.CorpusSuggestion>>
  ),
): Promise<Document<Interfaces.Corpus>> => {
  const newCorpus: Document<Interfaces.Corpus> | any = new Corpus(data);
  return newCorpus.save();
};

/* Creates a new Corpus document from an existing CorpusSuggestion document */
const createCorpusFromSuggestion = (
  suggestionDoc: Document<Interfaces.CorpusSuggestion>,
): Promise<Document<Interfaces.Corpus> | void> => (
  createCorpus(suggestionDoc.toObject())
    .then(async (corpus: Document<Interfaces.Corpus>) => {
      const updatedPronunciationsWord = await overwriteCorpusPronunciation(suggestionDoc, corpus);
      return updatedPronunciationsWord;
    })
    .catch((err) => {
      throw new Error(`An error occurred while saving the new corpus: ${err.message}`);
    })
);

/* Merges the existing CorpusSuggestion into either a brand
 * new Corpus document or merges into an existing Corpus document */
export const mergeCorpus = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { user, suggestionDoc } = req;

    const mergedCorpus: Document<Interfaces.Corpus> | any = (
      suggestionDoc.originalCorpusId
        ? await mergeIntoCorpus(suggestionDoc, user.uid)
        : await createCorpusFromSuggestion(suggestionDoc, user.uid)
    ) || {};
    return res.send(mergedCorpus);
  } catch (err) {
    return next(err);
  }
};
