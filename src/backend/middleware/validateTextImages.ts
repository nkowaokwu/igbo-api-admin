import { Response, NextFunction } from 'express';
import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

const textImageDataSchema = Joi.array().items(
  Joi.object().keys({
    igbo: Joi.string().allow('').required(),
  }),
);

export default async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<any> | void> => {
  const { body: finalData } = req;
  try {
    await textImageDataSchema.validateAsync(finalData, { abortEarly: false });
    return next();
  } catch (err) {
    res.status(400);
    return res.send({ error: err.message });
  }
};
