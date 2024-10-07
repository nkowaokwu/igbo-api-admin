import { Response, NextFunction } from 'express';
import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import UserRoles from 'src/backend/shared/constants/UserRoles';

export const userRoleSchema = Joi.object().keys({
  role: Joi.alternatives().try(...Object.values(UserRoles)),
});

export default async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: finalData } = req;

  try {
    await userRoleSchema.validateAsync(finalData, { abortEarly: false });
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
