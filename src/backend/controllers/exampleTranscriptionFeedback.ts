import { Connection, Query, Types } from 'mongoose';
import { NextFunction, Response } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { exampleTranscriptionFeedbackSchema } from 'src/backend/models/ExampleTranscriptionFeedback';

interface ExampleTranscriptionFeedbackQuery
  extends Query<
    Interfaces.ExampleTranscriptionFeedback,
    Interfaces.ExampleTranscriptionFeedback,
    unknown,
    Interfaces.ExampleTranscriptionFeedback
  > {}

/**
 * Finds a single Example Suggestion by its Id
 * @param id Id of the Example Suggestion
 * @param mongooseConnection Connection
 * @returns Single Example Suggestion
 */
export const findExampleTranscriptionFeedbackByExampleSuggestionId = (
  id: string,
  mongooseConnection: Connection,
): ExampleTranscriptionFeedbackQuery => {
  const ExampleTranscriptionFeedback = mongooseConnection.model<Interfaces.ExampleTranscriptionFeedback>(
    'ExampleTranscriptionFeedback',
    exampleTranscriptionFeedbackSchema,
  );
  return ExampleTranscriptionFeedback.findOne({ exampleSuggestionId: new Types.ObjectId(id) });
};

/* Returns a single ExampleTranscriptionFeedback by using an id */
export const getExampleTranscriptionFeedback = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const exampleTranscriptionFeedback = await findExampleTranscriptionFeedbackByExampleSuggestionId(
      id,
      mongooseConnection,
    );
    return res.send(exampleTranscriptionFeedback);
  } catch (err) {
    return next(err);
  }
};
