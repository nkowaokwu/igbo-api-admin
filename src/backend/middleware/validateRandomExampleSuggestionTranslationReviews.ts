import Joi from 'joi';
import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';

const REVIEW_BATCH_LIMIT = 5;
export const reviewsSchema = Joi.object().keys({
  id: Joi.string(),
  translations: Joi.array().items(
    Joi.object().keys({
      id: Joi.string(),
      review: Joi.alternatives(...Object.values(ReviewActions)),
    }),
  ),
});

export const randomExampleSuggestionReviewsForTranslationSchema = Joi.array()
  .items(reviewsSchema)
  .max(REVIEW_BATCH_LIMIT);

export default async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: finalData } = req;

  try {
    await randomExampleSuggestionReviewsForTranslationSchema.validateAsync(finalData, { abortEarly: false });
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
