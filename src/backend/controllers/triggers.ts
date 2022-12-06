import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { sendCreatedSuggestionNotification } from './email';

/* If triggered by clients, a new suggestion email to all editors, mergers, and admins */
export const onSendNewSuggestionsEmail = async (
  req: Interfaces.EditorRequest, res: Response, next: NextFunction,
): Promise<Response | void> => {
  try {
    const { body: data } = req;
    await sendCreatedSuggestionNotification(data);
    return res
      .status(200)
      .send('Emails sent to all editors for a suggestion');
  } catch (err) {
    console.log('an error occurred', err.message);
    return next(err);
  };
};
