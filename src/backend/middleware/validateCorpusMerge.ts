import { Response, NextFunction } from 'express';
import { findCorpusSuggestionById } from '../controllers/corpusSuggestions';
import * as Interfaces from '../controllers/utils/interfaces';

export default async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const { body: data } = req;
  const { user } = req;
  const suggestionDoc: any = (await findCorpusSuggestionById(data.id));

  if (!user || (user && !user.uid)) {
    res.status(400);
    return res.send({ error: 'User uid is required' });
  }

  if (!suggestionDoc) {
    res.status(400);
    return res.send({
      error: 'There is no associated corpus suggestion, double check your provided data',
    });
  }

  if (!suggestionDoc.title) {
    res.status(400);
    return res.send({ error: 'The title property is missing, double check your provided data' });
  }

  if (!suggestionDoc.body) {
    res.status(400);
    return res.send({ error: 'The body class property is missing, double check your provided data' });
  }

  if (!suggestionDoc.id) {
    res.status(400);
    return res.send({ error: 'The id property is missing, double check your provided data' });
  }
  req.suggestionDoc = suggestionDoc;
  return next();
};
