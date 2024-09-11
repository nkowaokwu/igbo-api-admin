import Joi from 'joi';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import LicenseType from 'src/backend/shared/constants/LicenseType';
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
});
