import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';

const schema = Joi.object({
  language: Joi.alternatives(...Object.values(LanguageLabels)),
});

const resolver = (): any => ({
  resolver: joiResolver(schema),
});

export default resolver;
