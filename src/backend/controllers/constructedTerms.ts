import { Response, NextFunction } from 'express';
import { createWord, getWords } from './words';
import * as Interfaces from './utils/interfaces';

// Get only constructedTerms from the dictionary
export const getConstructedTerms = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    req.query.constructedTerms = true;
    return await getWords(req, res, next);
  } catch (err) {
    return next(err);
  }
};

// TODO: Refactor this code
export const postConstructedTerm = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { body: data } = req;
    return await createWord(data);
  } catch (err) {
    return next(err);
  }
};
