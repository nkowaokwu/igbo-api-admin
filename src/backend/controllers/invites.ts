import { Response, NextFunction } from 'express';
import { IGBO_API_EDITOR_PLATFORM_ROOT, IGBO_API_PROJECT_ID } from 'src/backend/config';
import { sendMemberInvite } from 'src/backend/controllers/email';
import { getProjectByIdHelper } from 'src/backend/controllers/projects';
import {
  deleteUserProjectPermissionByEmailHelper,
  getUserProjectPermissionByDocIdHelper,
  getUserProjectPermissionByEmailHelper,
  getUserProjectPermissionHelper,
  postUserProjectPermissionHelper,
} from 'src/backend/controllers/userProjectPermissions';
import { postUserHelper } from 'src/backend/controllers/users';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { UserProjectPermission } from 'src/backend/controllers/utils/interfaces';
import Author from 'src/backend/shared/constants/Author';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import UserRoles from 'src/backend/shared/constants/UserRoles';

/**
 *
 * @param _
 * @param res
 * @returns Redirects the request to the login page while including the main inviting project
 */
export const inviteMemberForIgboAPI = async (_: Interfaces.EditorRequest, res: Response): Promise<void> => {
  const redirectUrl = `${IGBO_API_EDITOR_PLATFORM_ROOT}/?invitingProjectId=${IGBO_API_PROJECT_ID}`;
  return res.redirect(redirectUrl);
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns Responsible for accepting the open invite link to start contributing to the Igbo API
 */
export const acceptMemberInviteForIgboAPI = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ userProjectPermission: UserProjectPermission }> | void> => {
  try {
    const { mongooseConnection, user } = req;
    const { invitingProjectId } = req.query;

    if (invitingProjectId !== IGBO_API_PROJECT_ID) {
      throw new Error("You don't have access to this resource");
    }

    const userProjectPermissionPayload = {
      email: user.email,
      role: UserRoles.CROWDSOURCER,
      firebaseId: user.uid,
      grantingAdmin: Author.SYSTEM,
    };

    const existingUserProjectPermission = await getUserProjectPermissionHelper({
      mongooseConnection,
      projectId: invitingProjectId,
      uid: user.uid,
      status: EntityStatus.ACTIVE,
    });

    if (existingUserProjectPermission) {
      return res.send({ userProjectPermission: existingUserProjectPermission });
    }

    const userProjectPermission = await postUserProjectPermissionHelper({
      mongooseConnection,
      projectId: invitingProjectId,
      body: userProjectPermissionPayload,
    });
    return res.send({ userProjectPermission });
  } catch (err) {
    return next(err);
  }
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns A success message or throws an error for inviting a new project member
 */
export const inviteMember = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ success: boolean }> | void> => {
  try {
    const { mongooseConnection, body, user } = req;
    const { projectId } = req.query;
    const { email } = body;
    const project = await getProjectByIdHelper({ mongooseConnection, projectId });
    const existingUserProjectPermission = await getUserProjectPermissionByEmailHelper({
      mongooseConnection,
      projectId,
      email,
      status: EntityStatus.UNSPECIFIED,
    });
    if (existingUserProjectPermission) {
      throw new Error('An invite for this user already exists. The user must accept their existing invite.');
    }

    const userProjectPermissionPayload = {
      status: EntityStatus.PENDING,
      email,
      role: UserRoles.CROWDSOURCER,
      firebaseId: '',
      grantingAdmin: user.uid,
    };

    const userProjectPermission = await postUserProjectPermissionHelper({
      mongooseConnection,
      projectId,
      body: userProjectPermissionPayload,
    });

    // eslint-disable-next-line max-len
    const acceptUrl = `${IGBO_API_EDITOR_PLATFORM_ROOT}/invites/accept?projectId=${projectId}&permissionId=${userProjectPermission.id}`;

    await sendMemberInvite({
      to: email,
      projectId,
      permissionId: userProjectPermission.id,
      acceptUrl,
      projectTitle: project.toJSON().title,
      grantingAdmin: user.email,
    });
    return res.send({ success: true });
  } catch (err) {
    return next(err);
  }
};

export const acceptMemberInvite = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { mongooseConnection } = req;
    const { projectId, permissionId } = req.query;

    const userProjectPermission = await getUserProjectPermissionByDocIdHelper({
      mongooseConnection,
      id: permissionId,
      projectId,
      status: EntityStatus.PENDING,
    });

    if (!userProjectPermission) {
      console.log('There is no permission associated with this user and project');
      res.redirect(IGBO_API_EDITOR_PLATFORM_ROOT);
    }

    userProjectPermission.status = EntityStatus.ACTIVE;

    if (!userProjectPermission.toJSON().firebaseId) {
      const user = await postUserHelper({ email: userProjectPermission.email });
      userProjectPermission.firebaseId = user.uid;
    }

    const savedUserProjectPermission = await userProjectPermission.save();

    // eslint-disable-next-line max-len
    const redirectUrl = `${IGBO_API_EDITOR_PLATFORM_ROOT}?invitingProjectId=${projectId}&uid=${savedUserProjectPermission.firebaseId}`;

    return res.redirect(redirectUrl);
  } catch (err) {
    return next(err);
  }
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns Cancels the currently pending UserProjectPermission for invited user
 */
export const cancelMemberInvite = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ success: true }> | void> => {
  try {
    const { mongooseConnection, body } = req;
    const { projectId } = req.query;
    const userProjectPermission = await getUserProjectPermissionByEmailHelper({
      mongooseConnection,
      projectId,
      email: body.email,
      status: EntityStatus.PENDING,
    });

    if (!userProjectPermission) {
      throw new Error("A user permission doesn't exist for this project");
    }

    await deleteUserProjectPermissionByEmailHelper({ mongooseConnection, projectId, email: body.email });

    return res.send({ success: true });
  } catch (err) {
    return next(err);
  }
};
