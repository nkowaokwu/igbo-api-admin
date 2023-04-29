import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { BULK_UPLOAD_LIMIT } from 'src/Core/constants';
import { bulkSentencesSchema } from 'src/shared/schemas/buildSentencesSchema';

export const randomExampleSuggestionSchema = bulkSentencesSchema.max(BULK_UPLOAD_LIMIT);

export default async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: finalData } = req;

  try {
    await randomExampleSuggestionSchema.validateAsync(finalData, { abortEarly: false });
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
