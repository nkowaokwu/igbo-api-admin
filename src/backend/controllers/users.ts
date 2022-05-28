/* Get all users from Firebase */
import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { filter, compact, reduce } from 'lodash';
import UserRoles from '../shared/constants/UserRoles';
import { handleQueries } from './utils';
import * as Interfaces from './utils/interfaces';

const formatUser = (user = { customClaims: {}, metadata: {} }): Interfaces.FormattedUser => {
  const { customClaims, metadata } = user;
  return {
    uid: user.uid,
    id: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    role: customClaims?.role || '',
    editingGroup: customClaims?.editingGroup || '',
    lastSignInTime: metadata?.lastSignInTime,
    creationTime: metadata?.creationTime,
  };
};

/* Looks into Firebase for users */
export const findUsers = async (): Promise<Interfaces.FormattedUser[]> => {
  const result = await admin.auth().listUsers();
  const users = result.users.map((user) => formatUser(user));
  return users;
};

/* Grab all admins */
export const findAdminUsers = async (): Promise<Interfaces.FormattedUser[]> => {
  const adminUsers = filter(await findUsers(), (user) => user.role === UserRoles.ADMIN);
  return adminUsers;
};

/* Handle mapping to all admin user emails */
export const findAdminUserEmails = async (): Promise<string[]> => {
  const adminUsers = await findAdminUsers();
  let adminUserEmails = process.env.NODE_ENV === 'test' ? ['admin@example.com'] : [];
  adminUserEmails = compact(reduce(adminUsers, (emails: string[], user: Interfaces.FormattedUser) => {
    emails.push(user.email);
    return emails;
  }, []));
  return adminUserEmails;
};

/* Grab all editor, mergers, and admins */
export const findPermittedUsers = async (): Promise<Interfaces.FormattedUser[]> => {
  const permittedUsers = filter(await findUsers(), (user) => (
    user.role === UserRoles.EDITOR
    || user.role === UserRoles.MERGER
    || user.role === UserRoles.ADMIN
  ));
  return permittedUsers;
};

/* Handle mapping to all permitted user emails */
export const findPermittedUserEmails = async (): Promise<string[]> => {
  const permittedUsers = await findPermittedUsers();
  let permittedUserEmails = process.env.NODE_ENV === 'test' ? ['admin@example.com'] : [];
  permittedUserEmails = compact(reduce(permittedUsers, (emails: string[], user: Interfaces.FormattedUser) => {
    emails.push(user.email);
    return emails;
  }, []));
  return permittedUserEmails;
};

/* Grab all users in the Firebase database */
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<Response<any> | void> => {
  try {
    const { skip, limit, filters } = handleQueries(req);
    const users = (await findUsers()).filter((user) => (
      Object.values(filters).every((value: string) => {
        const displayName = user.displayName.toLowerCase();
        const { email } = user;
        return displayName.includes(value.toLowerCase()) || email.includes(value.toLowerCase());
      })
    ));
    const paginatedUsers = users.slice(skip, (skip + 1) + limit);
    res.setHeader('Content-Range', users.length);
    res.status(200);
    return res.send(paginatedUsers);
  } catch (err) {
    return next(new Error('An error occurred while grabbing all users'));
  }
};

/* Looks into Firebase for user */
// TODO: expand this function to look inside both Igbo API Editor Platform and Nkowaokwu Firebase projects
export const findUser = async (uid: string): Promise<Interfaces.FormattedUser | string> => {
  if (process.env.NODE_ENV !== 'test') {
    const user = await admin.auth().getUser(uid);
    return formatUser(user);
  }
  return uid;
};

/* Grab a single user from the Firebase database */
export const getUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const user = await findUser(uid);
    res.status(200);
    return res.send(user);
  } catch {
    return next(new Error('An error occurred while grabbing a single user'));
  }
};

export const testGetUsers = (_, res) => {
  res.status(200);
  return res.send([{}]);
};
