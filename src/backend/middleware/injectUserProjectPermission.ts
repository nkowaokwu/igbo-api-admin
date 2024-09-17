import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { getUserProjectPermissionHelper } from 'src/backend/controllers/userProjectPermissions';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';

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
