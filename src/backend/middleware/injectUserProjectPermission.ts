import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import {
  getUserProjectPermissionHelper,
  postUserProjectPermissionPlatformAdminHelper,
} from 'src/backend/controllers/userProjectPermissions';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import PlatformAdminUids from 'src/backend/shared/constants/PlatformAdminUids';

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns Injects the associated user project permission for current project.
 */
const injectUserProjectPermission = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ error: string }> | void> => {
  const { mongooseConnection, query, user } = req;
  const { projectId, invitingProjectId } = query;

  // Short-circuits and allows a Platform Admin to view all resources as admin
  if (PlatformAdminUids.includes(user.uid)) {
    const body = { email: user.email, firebaseId: user.uid };
    const userProjectPermission = postUserProjectPermissionPlatformAdminHelper({ mongooseConnection, projectId, body });
    req.user.role = userProjectPermission.role;
    req.userProjectPermission = userProjectPermission.toJSON();
    return next();
  }

  const userProjectPermission = await getUserProjectPermissionHelper({
    mongooseConnection,
    uid: user.uid,
    projectId: projectId?.toString() || invitingProjectId?.toString(),
  });

  if (!userProjectPermission || userProjectPermission.toJSON().status !== EntityStatus.ACTIVE) {
    return res.status(403).send({ error: "User does not have permission to view this project's resources" });
  }

  req.user.role = userProjectPermission.toJSON().role;
  req.userProjectPermission = userProjectPermission.toJSON();

  return next();
};

export default injectUserProjectPermission;
