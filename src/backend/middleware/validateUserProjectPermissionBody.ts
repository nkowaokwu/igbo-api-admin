import { Response, NextFunction } from 'express';
import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import UserRoles from 'src/backend/shared/constants/UserRoles';

export const baseUserProjectPermissionSchema = Joi.object().keys({
  languages: Joi.array()
    .optional()
    .min(0)
    .items(Joi.alternatives().try(...Object.values(LanguageEnum))),
  gender: Joi.alternatives()
    .try(...Object.values(GenderEnum))
    .optional(),
});

export const adminUserProjectPermissionSchema = baseUserProjectPermissionSchema.append({
  status: Joi.alternatives()
    .try(...Object.values(EntityStatus))
    .optional(),
  role: Joi.alternatives().try(...Object.values(UserRoles)),
});

export default async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const { role } = req.user;
  const { body: finalData } = req;

  try {
    if (role === UserRoles.ADMIN) {
      await adminUserProjectPermissionSchema.validateAsync(finalData, { abortEarly: false });
      return next();
    }
    await baseUserProjectPermissionSchema.validateAsync(finalData, { abortEarly: false });
    return next();
  } catch (err) {
    res.status(400);
    if (err.details) {
      const errorMessage = err.details.map(({ message }) => message);
      return res.send({ error: errorMessage });
    }
    return res.send({ error: err.message });
  }
};
