import type { Response, NextFunction } from 'express';
import { EditorRequest } from '../controllers/utils/interfaces';

const BULK_DELETE_LIMIT = 100;

export default async (req: EditorRequest, res: Response, next: NextFunction): Promise<any> => {
  const { body: data } = req;

  if (!Array.isArray(data)) {
    return res.status(400).send({ error: 'Invalid payload.' });
  }
  if (data.length > BULK_DELETE_LIMIT) {
    return res.status(400).send({ error: 'Too many documents attempted to be deleted. The limit is 100.' });
  }
  return next();
};
