import { NextFunction, Response } from 'express';
import Requirements from 'src/backend/shared/constants/Requirements';
import { isCypress } from 'src/backend/config';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

export default (req: Interfaces.EditorRequest, res: Response, next: NextFunction): void => {
  const { suggestionDoc } = req;
  if (!isCypress && suggestionDoc.approvals.length < Requirements.MINIMUM_REQUIRED_APPROVALS) {
    throw new Error("Suggestion document doesn't have enough approvals to be merged.");
  }
  return next();
};
