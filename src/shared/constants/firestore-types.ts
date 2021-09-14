import { Role } from './auth-types';

/**
 * The names of collections in the Firestore database
 */
export enum FirestoreCollections {
  ADMINS = 'admins',
  APPLICATIONS = 'applications',
  EDITORS = 'editors',
  MERGERS = 'mergers',
};

export interface NewUserApplication {
  email: string,
  role: Role,
  timeReceived: firebase.default.firestore.Timestamp,
  approved: boolean,
  timeApproved?: firebase.default.firestore.Timestamp,
};

export interface UpdatePermissions {
  uid: string,
  adminUid: string,
  role: Role,
};
