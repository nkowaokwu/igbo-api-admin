import { Response, NextFunction } from 'express';
import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

export const memberInviteSchema = Joi.object().keys({
  email: Joi.string().required(),
});

export default async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: finalData } = req;

  try {
    await memberInviteSchema.validateAsync(finalData, { abortEarly: false });
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
