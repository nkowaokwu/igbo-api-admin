import type { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction): void => {
  const { body, user: { uid } } = req;
  if (!body.userInteractions) {
    body.userInteractions = [];
  }
  if (!body.userInteractions.includes(uid)) {
    body.userInteractions.push(uid);
  }
  return next();
};
