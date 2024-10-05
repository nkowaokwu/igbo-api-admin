import Joi from 'joi';
import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';

const SENTENCE_BATCH_LIMIT = 5;
export const translationSchema = Joi.object().keys({
  id: Joi.string(),
  translations: Joi.array()
    .items(
      Joi.object().keys({
        text: Joi.string().messages({ 'string.empty': 'A translation is required.' }),
        language: Joi.alternatives()
          .try(...Object.values(LanguageEnum).filter((language) => language !== LanguageEnum.UNSPECIFIED))
          .messages({ 'alternatives.types': 'A language is required.' }),
        pronunciations: Joi.array().items(
          Joi.object().keys({
            audio: Joi.string().messages({ 'string.empty': 'An audio pronunciation is required.' }),
          }),
        ),
      }),
    )
    .required(),
});

export const randomExampleSuggestionTranslationSchema = Joi.array()
  .items(translationSchema)
  .max(SENTENCE_BATCH_LIMIT)
  .messages({ 'array.base': 'Must provide an array of translations.' });

export default async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: finalData } = req;

  try {
    await randomExampleSuggestionTranslationSchema.validateAsync(finalData, { abortEarly: false });
    return next();
  } catch (err) {
    console.log(err);
    res.status(400);
    if (err.details) {
      const errorMessage = err.details.map(({ message }) => message).join('. ');
      return res.send({ error: errorMessage });
    }
    return res.send({ error: err.message });
  }
};
