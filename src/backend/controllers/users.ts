/* Get all users from Firebase */
import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { filter, compact, reduce, merge } from 'lodash';
import { createMongoUser } from 'src/backend/functions/users';
import { crowdsourcerSchema } from 'src/backend/models/Crowdsourcer';
import cleanDocument from 'src/backend/shared/utils/cleanDocument';
import UserRoles from '../shared/constants/UserRoles';
import { handleQueries } from './utils';
import * as Interfaces from './utils/interfaces';

const cachedUsers = {};

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
    editingGroup: customClaims?.editingGroup || '',
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
  const users = result.users.map((user) => formatUser(user));
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
    const users = (await findUsers()).filter((user) =>
      Object.values(filters).every((value: string) => {
        const displayName = (user.displayName || '').toLowerCase();
        const { email, uid } = user;
        // Finds users where the value matches their name, email, or Firebase id
        return displayName.includes(value?.toLowerCase()) || email.includes(value?.toLowerCase()) || uid === value;
      }),
    );
    const paginatedUsers = users.slice(skip, skip + 1 + limit);
    return res.setHeader('Content-Range', users.length).status(200).send(paginatedUsers);
  } catch (err) {
    return next(new Error(`An error occurred while grabbing all users: ${err.message}`));
  }
};

/**
 * Finds a single Firebase user by looking in cache then Firebase Auth
 * @param uid
 * @returns Firebase user
 */
export const findUser = async (uid: string): Promise<Interfaces.FormattedUser | string> => {
  if (cachedUsers[uid]) {
    return cachedUsers[uid];
  }
  const user = await admin.auth().getUser(uid);
  const formattedUser = formatUser(user);
  cachedUsers[uid] = formattedUser;
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
    console.log(err);
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
      user: { uid },
      mongooseConnection,
    } = await handleQueries(req);
    const user = await findUser(uid);
    const Crowdsourcer = mongooseConnection.model<Interfaces.Crowdsourcer>('Crowdsourcer', crowdsourcerSchema);
    let crowdsourcer: Partial<Interfaces.Crowdsourcer> = await Crowdsourcer.findOne({
      firebaseId: uid,
    });
    if (!crowdsourcer) {
      crowdsourcer = cleanDocument<Interfaces.Crowdsourcer>(await createMongoUser(uid));
    } else {
      crowdsourcer = crowdsourcer.toJSON();
    }

    const userProfile = merge({
      ...(typeof user !== 'string' ? user : {}),
      ...(crowdsourcer ?? {}),
    });

    return res.status(200).send(userProfile);
  } catch (err) {
    return next(new Error('An error occurred while getting the user profile'));
  }
};

/**
 * Updates the user profile in MongoDB
 * @param req
 * @param res
 * @param next
 * @returns MongoDB user
 */
export const putUserProfile = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const {
      user: { uid },
      body,
      mongooseConnection,
    } = await handleQueries(req);
    const Crowdsourcer = mongooseConnection.model<Interfaces.Crowdsourcer>('Crowdsourcer', crowdsourcerSchema);
    const crowdsourcer = await Crowdsourcer.findOne({ firebaseId: uid });
    crowdsourcer.age = body.age;
    crowdsourcer.dialects = body.dialects;
    crowdsourcer.gender = body.gender;
    const savedCrowdsourcer = await crowdsourcer.save();

    return res.status(200).send(cleanDocument<Interfaces.Crowdsourcer>(savedCrowdsourcer.toJSON()));
  } catch (err) {
    return next(new Error(`An error occurred while updating the user profile: ${err.message}`));
  }
};
