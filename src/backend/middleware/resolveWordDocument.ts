import type { Response, NextFunction } from 'express';
import { EditorRequest, WordSuggestion } from '../controllers/utils/interfaces';
import Word from '../models/Word';

export default async (req: EditorRequest, res: Response, next: NextFunction): Promise<any> => {
  const data = req.body as WordSuggestion;
  if (data.originalWordId) {
    const word = await Word.findById(data.originalWordId);
    if (word) {
      req.word = word.toJSON();
    }
  }
  return next();
};
