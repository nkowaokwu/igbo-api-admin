import { NextFunction, Response } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import UserRoles from 'src/backend/shared/constants/UserRoles';

const MINIMUM_SPOKEN_LANGUAGES = 2;

export default (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Response<any> | void => {
  try {
    const { userProjectPermission } = req;
    const { role, languages } = userProjectPermission;

    switch (role) {
      case UserRoles.CROWDSOURCER:
      case UserRoles.MERGER:
      case UserRoles.EDITOR:
        return languages.length < MINIMUM_SPOKEN_LANGUAGES
          ? res.status(403).send({
              error: 'Unable to complete this request. Please select more languages that you speak to continue.',
            })
          : next();
      case UserRoles.ADMIN:
        return next();
      default:
        return res.status(403).send({
          error: 'Unable to complete this request. Please select more languages that you speak to continue. ',
        });
    }
  } catch (err) {
    return next(err);
  }
};
