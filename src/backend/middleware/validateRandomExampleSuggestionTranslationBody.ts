import Joi from 'joi';
import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { BULK_UPLOAD_LIMIT } from 'src/Core/constants';

export const randomExampleSuggestionTranslationSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.string().required(),
      english: Joi.string().empty(''),
    }),
  )
  .max(BULK_UPLOAD_LIMIT);

export default async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: finalData } = req;

  try {
    await randomExampleSuggestionTranslationSchema.validateAsync(finalData, { abortEarly: false });
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
