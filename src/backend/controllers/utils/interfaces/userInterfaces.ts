import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import { UserInfo } from 'firebase-functions/v1/auth';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';

export interface UserProfile extends UserInfo, FormattedUser {
  age: number;
  createdAt: string;
  dialects: DialectEnum[];
  firebaseId: string;
  gender: GenderEnum;
  updatedAt: Date;
  referralCode: string;
}

export interface FormattedUser {
  uid: string;
  id: string;
  photoURL: string;
  email: string;
  displayName: string;
  role: string;
  editingGroup: string;
  lastSignInTime: string;
  creationTime: string;
}

export type FirebaseUser = UserRecord;

export interface Crowdsourcer {
  firebaseId: string;
  id: string;
  referralCode: string;
  age: number;
  dialects: DialectEnum[];
  gender: GenderEnum[];
}

export interface Referral {
  id: string;
  referrerId: Crowdsourcer['firebaseId'];
  referredUserId: Crowdsourcer['firebaseId'];
}
