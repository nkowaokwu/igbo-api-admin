import { Response, NextFunction } from 'express';
import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import LicenseType from 'src/backend/shared/constants/LicenseType';
import ProjectType from 'src/backend/shared/constants/ProjectType';
import VisibilityType from 'src/backend/shared/constants/VisibilityType';

export const projectDataSchema = Joi.object().keys({
  title: Joi.string(),
  description: Joi.string(),
  status: Joi.alternatives().try(...Object.values(EntityStatus)),
  visibility: Joi.alternatives().try(...Object.values(VisibilityType)),
  license: Joi.alternatives().try(...Object.values(LicenseType)),
  languages: Joi.array()
    .min(0)
    .items(Joi.alternatives().try(...Object.values(LanguageEnum))),
  types: Joi.array()
    .min(0)
    .items(Joi.alternatives().try(...Object.values(ProjectType))),
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
