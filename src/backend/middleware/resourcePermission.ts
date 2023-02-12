import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import UserRoles from '../shared/constants/UserRoles';

/* Checks if the provided uid's resources can be accessed by the current requesting user */
const resourcePermission = (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Response | void => {
  const { user = {}, query } = req;
  const uidQuery = query.uid;

  // The requesting user is attempt to access their own resources
  if (uidQuery && user.uid === uidQuery) {
    return next();
  }

  // The requesting user is not specifying a uid, so they are attempting their own resources
  if (!uidQuery) {
    return next();
  }

  // The request user is an admin attempt to request another user's resources
  if (uidQuery && user.uid !== uidQuery && user.role === UserRoles.ADMIN) {
    return next();
  }

  return res
    .status(403)
    .send({ error: 'Unauthorized. Invalid user permissions to view the requested resource.' });
};

export default resourcePermission;
