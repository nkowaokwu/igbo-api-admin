import { Document, Query, Types } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { assign } from 'lodash';
import CorpusSuggestion from '../models/CorpusSuggestion';
import { packageResponse, handleQueries } from './utils';
import { searchPreExistingCorpusSuggestionsRegexQuery } from './utils/queries';
import * as Interfaces from './utils/interfaces';
import SuggestionTypes from '../shared/constants/SuggestionTypes';
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
    const { body: data } = req;
    const { user } = req;

    data.authorId = user.uid;
    const newCorpusSuggestion = new CorpusSuggestion(data);
    const savedCorpusSuggestion: Document<Interfaces.CorpusSuggestion> = await newCorpusSuggestion.save();
    return res.send(savedCorpusSuggestion);
  } catch (err) {
    return next(err);
  }
};

export const findCorpusSuggestionById = (id: string | Types.ObjectId)
: Query<any, Document<Interfaces.CorpusSuggestion>> => (
  CorpusSuggestion.findById(id)
);

export const deleteCorpusSuggestionByOriginalCorpusId = (id: string | Types.ObjectId)
: Query<any, Document<Interfaces.CorpusSuggestion>> => (
  CorpusSuggestion.deleteMany({ originalWordId: id })
);

/* Grabs CorpusSuggestions */
const findCorpusSuggestions = async (
  { regexMatch, skip, limit }:
  { regexMatch: RegExp, skip: number, limit: number },
): Promise<Interfaces.CorpusSuggestion[] | any> => (
  CorpusSuggestion
    .find(regexMatch, null, { sort: { updatedAt: -1 } })
    .skip(skip)
    .limit(limit)
);

/* Updates an existing CorpusSuggestion object */
export const putCorpusSuggestion = (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> | void => {
  try {
    const {
      body: data,
      params: { id },
    } = req;
    return findCorpusSuggestionById(id)
      .then(async (corpusSuggestion: Interfaces.CorpusSuggestion) => {
        if (!corpusSuggestion) {
          throw new Error('Corpus suggestion doesn\'t exist');
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
    const {
      regexKeyword,
      skip,
      limit,
      filters,
      ...rest
    } = handleQueries(req);
    const regexMatch = searchPreExistingCorpusSuggestionsRegexQuery(regexKeyword, filters);
    return findCorpusSuggestions({ regexMatch, skip, limit })
      .then(async (corpusSuggestions: [Interfaces.CorpusSuggestion]) => (
        packageResponse({
          res,
          docs: corpusSuggestions,
          model: CorpusSuggestion,
          query: regexMatch,
          ...rest,
        })
      ))
      .catch(next);
  } catch (err) {
    return next(err);
  }
};

/* Returns a single CorpusSuggestion by using an id */
export const getCorpusSuggestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const populatedCorpusSuggestion: Document<Interfaces.CorpusSuggestion> = await CorpusSuggestion
      .findById(id)
      .then(async (corpusSuggestion: Interfaces.CorpusSuggestion) => {
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
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> | void => {
  try {
    const { id } = req.params;
    return CorpusSuggestion.findByIdAndDelete(id)
      .then(async (corpusSuggestion: Interfaces.CorpusSuggestion) => {
        if (!corpusSuggestion) {
          throw new Error('No corpus suggestion exists with the provided id.');
        }
        await deleteMedia(id);

        const { email: userEmail } = await findUser(corpusSuggestion.authorId) as Interfaces.FormattedUser;
        /* Sends rejection email to user if they provided an email and the corpusSuggestion isn't merged */
        if (userEmail && !corpusSuggestion.merged) {
          sendRejectedEmail({
            to: [userEmail],
            suggestionType: SuggestionTypes.WORD,
            ...(corpusSuggestion.toObject()),
          });
        }
        return res.send(corpusSuggestion);
      })
      .catch(() => {
        throw new Error('An error has occurred while deleting and return a single corpus suggestion');
      });
  } catch (err) {
    return next(err);
  }
};

export const approveCorpusSuggestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.CorpusSuggestion> | void> => {
  const { params: { id }, user } = req;
  try {
    const corpusSuggestion = await CorpusSuggestion.findById(id);
    if (!corpusSuggestion) {
      throw new Error('Corpus suggestion doesn\'t exist');
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
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.CorpusSuggestion> | void> => {
  const { params: { id }, user } = req;
  try {
    const corpusSuggestion = await CorpusSuggestion.findById(id);
    if (!corpusSuggestion) {
      throw new Error('Corpus suggestion doesn\'t exist');
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
