import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { adminRoles } from 'src/backend/shared/constants/RolePermissions';

/* Checks if the provided uid's resources can be accessed by the current requesting user */
const resourcePermission = (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Response | void => {
  const { user = {}, query, params } = req;
  const uidQuery = query.uid || params.uid;

  // The requesting user is attempt to access their own resources
  if (uidQuery && user.uid === uidQuery) {
    return next();
  }

  // The requesting user is not specifying a uid, so they are attempting their own resources
  if (!uidQuery) {
    return next();
  }

  // The request user is an admin attempt to request another user's resources
  if (uidQuery && user.uid !== uidQuery && adminRoles.includes(user.role)) {
    return next();
  }

  return res.status(403).send({ error: 'Unauthorized. Invalid user permissions to view the requested resource.' });
};

export default resourcePermission;
