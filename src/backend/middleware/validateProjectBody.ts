import { Response, NextFunction } from 'express';
import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import LicenseType from 'src/backend/shared/constants/LicenseType';
import VisibilityType from 'src/backend/shared/constants/VisibilityType';

export const projectDataSchema = Joi.object().keys({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  status: Joi.alternatives()
    .try(...Object.values(EntityStatus))
    .optional(),
  visibility: Joi.alternatives()
    .try(...Object.values(VisibilityType))
    .optional(),
  license: Joi.alternatives()
    .try(...Object.values(LicenseType))
    .optional(),
  languages: Joi.array()
    .min(0)
    .items(Joi.alternatives().try(...Object.values(LanguageEnum)))
    .optional(),
});

export default async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: finalData } = req;

  try {
    await projectDataSchema.validateAsync(finalData, { abortEarly: false });
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
