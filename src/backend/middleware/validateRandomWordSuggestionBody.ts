import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

const { Types } = mongoose;
export const randomWordSuggestionSchema = Joi.array().items(Joi.object().keys({
  id: Joi.string().external(async (value) => {
    if (value && !Types.ObjectId.isValid(value)) {
      throw new Error('Invalid id provided');
    }
    return true;
  }).allow(null).optional(),
  igboDefinition: Joi.string(),
}));

export default async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: finalData } = req;

  try {
    await randomWordSuggestionSchema.validateAsync(finalData, { abortEarly: false });
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
