import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { map, trim } from 'lodash';

export default (req: Request, res: Response, next: NextFunction): Response | void => {
  const { body: data } = req;

  if (data.originalWordId && !mongoose.Types.ObjectId.isValid(data.originalWordId)) {
    res.status(400);
    return res.send({ error: 'Invalid word id provided' });
  }

  if (!data.word) {
    res.status(400);
    return res.send({ error: 'Word is required' });
  }

  if (!data.wordClass) {
    res.status(400);
    return res.send({ error: 'Word class is required' });
  }

  if (!data.definitions || !data.definitions.length) {
    res.status(400);
    return res.send({ error: 'At least one definition is required' });
  }

  if (!Array.isArray(data.definitions)) {
    data.definitions = data.definitions ? map(data.definitions.split(','), (definition) => trim(definition)) : [];
  }

  return next();
};
