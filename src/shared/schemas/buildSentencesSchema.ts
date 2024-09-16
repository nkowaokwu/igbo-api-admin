import Joi from 'joi';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';

export const bulkSentencesSchema = Joi.array().items(
  Joi.object({
    source: {
      language: Joi.alternatives(...Object.values(LanguageEnum)),
      text: Joi.string().required(),
    },
  }),
);
