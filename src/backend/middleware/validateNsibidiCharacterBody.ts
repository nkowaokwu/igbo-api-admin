import { Response, NextFunction } from 'express';
import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import WordClass from '../shared/constants/WordClass';

const nsibidiCharacterDataSchema = Joi.object().keys({
  nsibidi: Joi.string().required(),
  pronunciation: Joi.string(),
  wordClass: Joi.string()
    .valid(...Object.values(WordClass).map(({ nsibidiValue }) => nsibidiValue))
    .required(),
  definitions: Joi.array()
    .min(0)
    .items(
      Joi.object().keys({
        text: Joi.string().required(),
      }),
    ),
  radicals: Joi.array()
    .min(0)
    .items(
      Joi.object().keys({
        id: Joi.string().required(),
      }),
    ),
});

export default async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: finalData } = req;

  try {
    await nsibidiCharacterDataSchema.validateAsync(finalData, { abortEarly: false });
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
