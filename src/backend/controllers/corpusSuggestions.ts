import { Connection, Document, Query, Types } from 'mongoose';
import { Response, NextFunction } from 'express';
import { assign } from 'lodash';
import { corpusSchema } from '../models/Corpus';
import { corpusSuggestionSchema } from '../models/CorpusSuggestion';
import { packageResponse, handleQueries } from './utils';
import { searchPreExistingCorpusSuggestionsRegexQuery } from './utils/queries';
import * as Interfaces from './utils/interfaces';
import SuggestionTypeEnum from '../shared/constants/SuggestionTypeEnum';
import { sendRejectedEmail } from './email';
import { findUser } from './users';
import { deleteMedia } from './utils/MediaAPIs/CorpusMediaAPI';

/* Creates a new CorpusSuggestion document in the database */
export const postCorpusSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { body: data, user, mongooseConnection } = req;
    const { projectId } = req.query;
    const CorpusSuggestion = mongooseConnection.model('CorpusSuggestion', corpusSuggestionSchema);
    const Corpus = mongooseConnection.model('Corpus', corpusSchema);
    let corpus = null;
    data.authorId = user.uid;
    if (data.originalCorpusId) {
      corpus = await Corpus.findOne({ _id: data.originalCorpusId, projectId });
    }
    // Apply media link on the backend for child corpus suggestions
    const newCorpusSuggestion = new CorpusSuggestion({ ...data, media: (corpus || {}).media, projectId });
    const savedCorpusSuggestion: Document<Interfaces.CorpusSuggestion> = await newCorpusSuggestion.save();
    return res.send(savedCorpusSuggestion);
  } catch (err) {
    return next(err);
  }
};

export const findCorpusSuggestionById = (
  id: string | Types.ObjectId,
  projectId: string,
  mongooseConnection,
): Query<any, Document<Interfaces.CorpusSuggestion>> => {
  const CorpusSuggestion = mongooseConnection.model('CorpusSuggestion', corpusSuggestionSchema);
  return CorpusSuggestion.findOne({ _id: id, projectId });
};

/* Grabs CorpusSuggestions */
const findCorpusSuggestions = async ({
  regexMatch,
  skip,
  limit,
  mongooseConnection,
}: {
  regexMatch: RegExp;
  skip: number;
  limit: number;
  mongooseConnection: Connection;
}): Promise<Interfaces.CorpusSuggestion[] | any> => {
  const CorpusSuggestion = mongooseConnection.model('CorpusSuggestion', corpusSuggestionSchema);

  return CorpusSuggestion.find(regexMatch, null, { sort: { updatedAt: -1 } })
    .skip(skip)
    .limit(limit);
};

/* Updates an existing CorpusSuggestion object */
export const putCorpusSuggestion = (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> | void => {
  try {
    const {
      body: data,
      params: { id },
      query: { projectId },
      mongooseConnection,
    } = req;
    return findCorpusSuggestionById(id, projectId, mongooseConnection)
      .then(async (corpusSuggestion: Interfaces.CorpusSuggestion) => {
        if (!corpusSuggestion) {
          throw new Error("Corpus suggestion doesn't exist");
        }

        delete data.authorId;
        const updatedCorpusSuggestion = assign(corpusSuggestion, data);

        /* We call updatedCorpusSuggestion.save() before handling media to work with only URIs */
        const savedCorpusSuggestion = await updatedCorpusSuggestion.save();

        return res.send(savedCorpusSuggestion);
      })
      .catch(next);
  } catch (err) {
    return next(err);
  }
};

/* Returns all existing CorpusSuggestions objects */
export const getCorpusSuggestions = (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> | void => {
  try {
    const { regexKeyword, skip, limit, filters, user, mongooseConnection, ...rest } = handleQueries(req);
    const { projectId } = req.query;
    const CorpusSuggestion = mongooseConnection.model('CorpusSuggestion', corpusSuggestionSchema);
    const regexMatch = searchPreExistingCorpusSuggestionsRegexQuery(regexKeyword, projectId, filters);
    return findCorpusSuggestions({
      regexMatch,
      skip,
      limit,
      mongooseConnection,
    }).then(async (corpusSuggestions: [Interfaces.CorpusSuggestion]) =>
      packageResponse({
        res,
        docs: corpusSuggestions,
        model: CorpusSuggestion,
        query: regexMatch,
        ...rest,
      }),
    );
  } catch (err) {
    return next(err);
  }
};

/* Returns a single CorpusSuggestion by using an id */
export const getCorpusSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const { projectId } = req.query;
    const CorpusSuggestion = mongooseConnection.model('CorpusSuggestion', corpusSuggestionSchema);
    const populatedCorpusSuggestion: Document<Interfaces.CorpusSuggestion> = await CorpusSuggestion.findOne({
      _id: id,
      projectId,
    }).then(async (corpusSuggestion: Interfaces.CorpusSuggestion) => {
      if (!corpusSuggestion) {
        throw new Error('No corpus suggestion exists with the provided id.');
      }
      return corpusSuggestion;
    });
    return res.send(populatedCorpusSuggestion);
  } catch (err) {
    return next(err);
  }
};

/* Deletes a single CorpusSuggestion by using an id */
export const deleteCorpusSuggestion = (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> | void => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const { projectId } = req.query;
    const CorpusSuggestion = mongooseConnection.model('CorpusSuggestion', corpusSuggestionSchema);

    return CorpusSuggestion.findOneAndDelete({ _id: id, projectId })
      .then(async (corpusSuggestion: Interfaces.CorpusSuggestion) => {
        if (!corpusSuggestion) {
          throw new Error('No corpus suggestion exists with the provided id.');
        }
        await deleteMedia(id);

        const { email: userEmail } = (await findUser(corpusSuggestion.authorId)) as Interfaces.FormattedUser;
        /* Sends rejection email to user if they provided an email and the corpusSuggestion isn't merged */
        if (userEmail && !corpusSuggestion.merged) {
          sendRejectedEmail({
            to: [userEmail],
            suggestionType: SuggestionTypeEnum.WORD,
            ...corpusSuggestion.toObject(),
          });
        }
        return res.send(corpusSuggestion);
      })
      .catch(() => {
        throw new Error('An error has occurred while deleting and returning a single corpus suggestion');
      });
  } catch (err) {
    return next(err);
  }
};

export const approveCorpusSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.CorpusSuggestion> | void> => {
  const {
    params: { id },
    query: { projectId },
    user,
    mongooseConnection,
  } = req;
  const CorpusSuggestion = mongooseConnection.model('CorpusSuggestion', corpusSuggestionSchema);

  try {
    const corpusSuggestion = await CorpusSuggestion.findOne({ _id: id, projectId });
    if (!corpusSuggestion) {
      throw new Error("Corpus suggestion doesn't exist");
    }
    const updatedApprovals = new Set(corpusSuggestion.approvals);
    const updatedDenials = corpusSuggestion.denials.filter((uid) => uid !== user.uid);
    updatedApprovals.add(user.uid);
    corpusSuggestion.approvals = Array.from(updatedApprovals);
    corpusSuggestion.denials = updatedDenials;
    const savedCorpusSuggestion = await corpusSuggestion.save();
    return res.send(savedCorpusSuggestion);
  } catch (err) {
    return next(err);
  }
};

export const denyCorpusSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.CorpusSuggestion> | void> => {
  const {
    params: { id },
    query: { projectId },
    user,
    mongooseConnection,
  } = req;
  const CorpusSuggestion = mongooseConnection.model('CorpusSuggestion', corpusSuggestionSchema);

  try {
    const corpusSuggestion = await CorpusSuggestion.findOne({ _id: id, projectId });
    if (!corpusSuggestion) {
      throw new Error("Corpus suggestion doesn't exist");
    }
    const updatedDenials = new Set(corpusSuggestion.denials);
    const updatedApprovals = corpusSuggestion.approvals.filter((uid) => uid !== user.uid);
    updatedDenials.add(user.uid);
    corpusSuggestion.denials = Array.from(updatedDenials);
    corpusSuggestion.approvals = updatedApprovals;
    const savedCorpusSuggestion = await corpusSuggestion.save();
    return res.send(savedCorpusSuggestion);
  } catch (err) {
    return next(err);
  }
};
