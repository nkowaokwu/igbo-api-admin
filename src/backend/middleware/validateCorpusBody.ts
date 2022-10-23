import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export default (req: Request, res: Response, next: NextFunction): Response | void => {
  const { body: data } = req;

  if (data.originalWordId && !mongoose.Types.ObjectId.isValid(data.originalWordId)) {
    res.status(400);
    return res.send({ error: 'Invalid word id provided' });
  }

  if (!data.title) {
    res.status(400);
    return res.send({ error: 'Title is required' });
  }

  if (!data.body) {
    res.status(400);
    return res.send({ error: 'Body is required' });
  }

  return next();
};
