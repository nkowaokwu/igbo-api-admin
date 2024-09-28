import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import LicenseType from 'src/backend/shared/constants/LicenseType';
import ProjectLabels from 'src/backend/shared/constants/ProjectLabels';

const schema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  types: Joi.array()
    .min(1)
    .items(Joi.alternatives(...Object.values(ProjectLabels))),
  languages: Joi.array()
    .min(1)
    .items(Joi.alternatives(...Object.values(LanguageLabels))),
  license: Joi.alternatives(...Object.values(LicenseType).map((license) => ({ value: license, label: license }))),
});

const resolver = (): any => ({
  resolver: joiResolver(schema),
});

export default resolver;
