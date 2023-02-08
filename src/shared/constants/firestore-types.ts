import UserRoles from 'src/backend/shared/constants/UserRoles';

/**
 * The names of collections in the Firestore database
 */
export enum FirestoreCollections {
  ADMINS = 'admins',
  APPLICATIONS = 'applications',
  EDITORS = 'editors',
  TRANSCRIBERS = 'transcribers',
  MERGERS = 'mergers',
};

export interface NewUserApplication {
  email: string,
  role: UserRoles,
  timeReceived: firebase.default.firestore.Timestamp,
  approved: boolean,
  timeApproved?: firebase.default.firestore.Timestamp,
};

export interface UpdatePermissions {
  email: string,
  uid: string,
  adminUid: string,
  role: UserRoles,
  displayName: string,
};
