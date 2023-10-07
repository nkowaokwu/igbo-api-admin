import { Response, NextFunction } from 'express';
import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import NsibidiCharacterAttributes from 'src/backend/shared/constants/NsibidiCharacterAttributes';

const nsibidiCharacterDataSchema = Joi.object().keys({
  nsibidi: Joi.string().required(),
  attributes: Joi.object().keys(
    Object.values(NsibidiCharacterAttributes).reduce(
      (finalSchema, { value }) => ({
        ...finalSchema,
        [value]: Joi.boolean().optional(),
      }),
      {},
    ),
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
