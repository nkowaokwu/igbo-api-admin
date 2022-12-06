import type { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

export default (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): void => {
  const { body, user: { uid } } = req;
  if (!body.userInteractions) {
    body.userInteractions = [];
  }
  if (!body.userInteractions.includes(uid)) {
    body.userInteractions.push(uid);
  }
  return next();
};
