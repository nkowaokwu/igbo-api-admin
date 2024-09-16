import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import {
  getUserProjectPermissionHelper,
  postUserProjectPermissionHelper,
} from 'src/backend/controllers/userProjectPermissions';
import { PROJECT_ID } from 'src/backend/config';
import Author from 'src/backend/shared/constants/Author';
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
  const { projectId } = query;

  let userProjectPermission = await getUserProjectPermissionHelper({
    mongooseConnection,
    uid: user.uid,
    projectId: projectId.toString(),
  });

  // If a user doesn't have a project permission for the Igbo API project
  // create one on the fly
  if (!userProjectPermission && projectId.toString() === PROJECT_ID) {
    userProjectPermission = await postUserProjectPermissionHelper({
      mongooseConnection,
      projectId: projectId.toString(),
      body: {
        firebaseId: user.uid,
        email: user.email,
        role: user.role, // Use existing role
        grantingAdmin: Author.SYSTEM,
      },
    });
  }

  if (!userProjectPermission || userProjectPermission.toJSON().status !== EntityStatus.ACTIVE) {
    return res.status(403).send({ error: "User does not have permission to view this project's resources" });
  }

  req.user.role = userProjectPermission.toJSON().role;
  req.userProjectPermission = userProjectPermission.toJSON();

  return next();
};

export default injectUserProjectPermission;
