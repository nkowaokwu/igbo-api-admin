/* Get all users from Firebase */
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { UserRecord } from 'firebase-functions/v1/auth';
import { filter, compact, reduce, merge, assign } from 'lodash';
import { Connection } from 'mongoose';
import {
  deleteUserProjectPermissionHelper,
  getUserProjectPermissionsByProjectHelper,
} from 'src/backend/controllers/userProjectPermissions';
import { userProjectPermissionSchema } from 'src/backend/models/UserProjectPermissions';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import UserRoles from '../shared/constants/UserRoles';
import { handleQueries } from './utils';
import * as Interfaces from './utils/interfaces';

const cachedUsers: { [key: string]: Interfaces.FormattedUser } = {};

/**
 * Formats provided FirebaseUser
 * @param user
 * @returns User
 */
export const formatUser = (user: Interfaces.FirebaseUser): Interfaces.FormattedUser => {
  const { customClaims, metadata } = user;
  return {
    uid: user.uid,
    id: user.uid,
    photoURL: user.photoURL,
    email: user.email || '',
    displayName: user.displayName || '',
    role: customClaims?.role || '',
    lastSignInTime: metadata?.lastSignInTime,
    creationTime: metadata?.creationTime,
  };
};

/**
 * Fetches all Firebase users
 * @returns All Firebase users
 */
export const findUsers = async (): Promise<Interfaces.FormattedUser[]> => {
  const result = await admin.auth().listUsers();
  const users = result.users.map(formatUser);
  return users;
};

/**
 *
 * @param param0 List of uids to fetch
 * @returns Fetches specified Firebase users
 */
const findUsersByUid = async ({
  uids,
  mongooseConnection,
  projectId,
}: {
  uids: string[];
  mongooseConnection: Connection;
  projectId: string;
}): Promise<Interfaces.FormattedUser[]> => {
  const result = await Promise.all(
    uids.map((uid) =>
      admin
        .auth()
        .getUser(uid)
        .catch(async () => {
          await deleteUserProjectPermissionHelper({ mongooseConnection, projectId, uid });
        }),
    ),
  );
  const users = compact(result).map(formatUser);
  return users;
};

/**
 * Gets all admin users
 * @returns Admin Firebase users
 */
export const findAdminUsers = async (): Promise<Interfaces.FormattedUser[]> => {
  const adminUsers = filter(await findUsers(), (user) => user.role === UserRoles.ADMIN);
  return adminUsers;
};

/**
 * Creates a map of all admin users
 * @returns Map of admin users
 */
export const findAdminUserEmails = async (): Promise<string[]> => {
  const adminUsers = await findAdminUsers();
  let adminUserEmails = process.env.NODE_ENV === 'test' ? ['admin@example.com'] : [];
  adminUserEmails = compact(
    reduce(
      adminUsers,
      (emails: string[], user: Interfaces.FormattedUser) => {
        emails.push(user.email);
        return emails;
      },
      [],
    ),
  );
  return adminUserEmails;
};

/**
 * Gets all editors, mergers, and admins
 * @returns Firebase users with editor, merger, or admin role
 */
export const findPermittedUsers = async (): Promise<Interfaces.FormattedUser[]> => {
  const permittedUsers = filter(
    await findUsers(),
    (user) => user.role === UserRoles.EDITOR || user.role === UserRoles.MERGER || user.role === UserRoles.ADMIN,
  );
  return permittedUsers;
};

/**
 * Gets all emails associated with editor, merger, or admin accounts
 * @returns Permitted emails
 */
export const findPermittedUserEmails = async (): Promise<string[]> => {
  const permittedUsers = await findPermittedUsers();
  const permittedUserEmails = compact(permittedUsers.map(({ email }) => email));
  return permittedUserEmails;
};

/**
 * Gets all Firebase users
 * @param req
 * @param res
 * @param next
 * @returns All Firebase users
 */
export const getUsers = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<any> | void> => {
  try {
    const { skip, limit, filters } = await handleQueries(req);
    const { mongooseConnection } = req;
    const { projectId } = req.query;
    let users = [];

    const allUserProjectPermissions = await getUserProjectPermissionsByProjectHelper({
      mongooseConnection,
      projectId,
      status: EntityStatus.UNSPECIFIED,
      skip: 0,
      limit: 10000,
    });

    const totalUsersCount = allUserProjectPermissions.length;

    // If the client is searching for a user use the following logic
    if (Object.values(filters).length || Boolean(skip)) {
      users = (await findUsers()).filter((user) =>
        Object.values(filters).every((value: string) => {
          const displayName = (user.displayName || '').toLowerCase();
          const { email, uid } = user;
          // Finds users where the value matches their name, email, or Firebase id
          return (
            displayName.includes(value?.toLowerCase?.()) || email.includes(value?.toLowerCase?.()) || uid === value
          );
        }),
      );
      users = users.slice(skip, skip + 1 + limit);

      const userProjectPermissions = allUserProjectPermissions.filter((userProjectPermission) =>
        users.find(({ uid }) => uid === userProjectPermission.toJSON().firebaseId),
      );

      userProjectPermissions.forEach((userProjectPermission) => {
        const userIndex = users.findIndex(({ uid }) => uid === userProjectPermission.toJSON().firebaseId);
        if (userIndex !== -1) {
          users[userIndex] = assign(users[userIndex], userProjectPermission.toJSON());
        }
      });
    } else {
      // Else we'll look at user permission documents first
      const userProjectPermissions = allUserProjectPermissions
        .slice(skip, limit)
        .map((userProjectPermission) => userProjectPermission.toJSON());

      const userProjectPermissionsWithoutFirebase = userProjectPermissions.filter(({ firebaseId }) => !firebaseId);

      const uids = userProjectPermissions.map(({ firebaseId }) => firebaseId);

      users = await findUsersByUid({ uids, mongooseConnection, projectId });

      // Joins Firebase users and UserProjectPermissions
      users = users
        .map((user) => {
          const userProjectPermissionIndex = userProjectPermissions.findIndex(
            ({ firebaseId }) => firebaseId === user.uid,
          );
          if (userProjectPermissionIndex !== -1) {
            const currentUserProjectPermission = userProjectPermissions[userProjectPermissionIndex];
            return assign(user, currentUserProjectPermission, { id: user.uid, _id: currentUserProjectPermission.id });
          }
          return user;
        })
        .concat(
          userProjectPermissionsWithoutFirebase.map(({ email, role, status }) => ({
            displayName: '',
            email,
            role,
            status,
            uid: '',
            id: email,
            lastSignInTime: null,
          })),
        );
    }

    return res.setHeader('Content-Range', totalUsersCount).status(200).send(users);
  } catch (err) {
    return next(new Error(`An error occurred while grabbing all users: ${err.message}`));
  }
};

/**
 * Finds a single Firebase user by looking in cache then Firebase Auth
 * @param uid
 * @returns Firebase user
 */
export const findUser = async (uid: string): Promise<Interfaces.FormattedUser> => {
  if (cachedUsers[uid]) {
    return cachedUsers[uid];
  }
  const user = await admin.auth().getUser(uid);
  const formattedUser = formatUser(user);
  cachedUsers[uid] = formattedUser;
  return formattedUser;
};

/**
 * Finds a single Firebase user by looking with their email
 * @param email
 * @returns Firebase user
 */
export const findUserByEmail = async (email: string): Promise<Interfaces.FormattedUser> => {
  const user = await admin.auth().getUserByEmail(email);
  const formattedUser = formatUser(user);
  return formattedUser;
};

/**
 * Gets a single user from Firebase
 * @param req
 * @param res
 * @param next
 * @returns Firebase user
 */
export const getUser = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { uid } = req.params;
    const user = await findUser(uid);
    return res.status(200).send(user);
  } catch (err) {
    // console.log(err);
    return next(new Error('An error occurred while grabbing a single user'));
  }
};

export const testGetUsers = (_: Request, res: Response): Response<any> => res.status(200).send([{}]);

/**
 * Gets the user profile from Firebase and MongoDB. If the user doesn't exist in MongoDB
 * then a Crowdsourcer document will be created.
 * @param req
 * @param res
 * @param next
 * @returns Firebase + MongoDB user
 */
export const getUserProfile = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const {
      user: { uid, role },
      params: { uid: firebaseId },
      mongooseConnection,
    } = await handleQueries(req);
    const { projectId } = req.query;
    const { userProjectPermission } = req;
    const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
      'UserProjectPermission',
      userProjectPermissionSchema,
    );
    let userProfile = {};
    const firebaseUser = await findUser(firebaseId);

    if (role === UserRoles.ADMIN) {
      const nonAdminUserProjectPermission = await UserProjectPermission.findOne({ firebaseId, projectId });

      if (!userProjectPermission) {
        throw new Error('No user exists with this project');
      }
      userProfile = merge({
        ...firebaseUser,
        ...nonAdminUserProjectPermission.toJSON(),
        id: firebaseId,
        _id: userProjectPermission.id,
      });
    } else {
      const firebaseUser = await findUser(uid);
      userProfile = merge({
        ...firebaseUser,
        ...userProjectPermission,
        id: uid,
        _id: userProjectPermission.id,
      });
    }
    return res.status(200).send(userProfile);
  } catch (err) {
    return next(new Error(`An error occurred while getting the user profile: ${err.message}`));
  }
};

/**
 *
 * @param param0
 * @returns Creates a new Firebase user
 */
export const postUserHelper = async ({ email }: { email: string }): Promise<UserRecord> => {
  const user = await admin.auth().createUser({
    email,
    emailVerified: true,
    disabled: false,
  });
  console.log(`Successfully created a new user: ${user.uid}`);
  return user;
};
