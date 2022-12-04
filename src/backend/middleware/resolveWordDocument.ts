import type { Response, NextFunction } from 'express';
import { EditorRequest } from '../controllers/utils/interfaces';
import { wordSchema } from '../models/Word';

export default async (req: EditorRequest, res: Response, next: NextFunction): Promise<any> => {
  const { body: data, mongooseConnection } = req;
  const Word = mongooseConnection.model('Word', wordSchema);

  if (data.originalWordId) {
    const word = await Word.findById(data.originalWordId);
    if (word) {
      req.word = word.toJSON();
    }
  }
  return next();
};
