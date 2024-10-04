import Joi from 'joi';
import type { Response, NextFunction } from 'express';
import { EditorRequest } from '../controllers/utils/interfaces';

const BULK_DELETE_LIMIT = 100;

const bulkDeleteSchema = Joi.array().items(Joi.string()).max(BULK_DELETE_LIMIT);

export default async (req: EditorRequest, res: Response, next: NextFunction): Promise<any> => {
  const { body: finalData } = req;

  try {
    await bulkDeleteSchema.validateAsync(finalData, { abortEarly: false });
    return next();
  } catch (err) {
    res.status(400);
    if (err.details) {
      const errorMessage = err.details.map(({ message }) => message.join('. '));
      return res.send({ error: errorMessage });
    }
    return res.send({ error: err.message });
  }
};
