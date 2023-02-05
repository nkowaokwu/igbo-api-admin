import { Response, NextFunction } from 'express';
import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { BULK_UPLOAD_LIMIT } from 'src/Core/constants';

export const randomExampleSuggestionSchema = Joi.array().max(BULK_UPLOAD_LIMIT).items(Joi.object().keys({
  igbo: Joi.string(),
}));

export default async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: finalData } = req;

  try {
    await randomExampleSuggestionSchema.validateAsync(finalData, { abortEarly: false });
    return next();
  } catch (err) {
    res.status(400);
    if (err.details) {
      const errorMessage = err.details.map(({ message }) => message).join('. ');
      return res.send({ error: errorMessage });
    }
    return res.send({ error: err.message });
  }
};
