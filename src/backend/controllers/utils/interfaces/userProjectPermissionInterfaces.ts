import { Types } from 'mongoose';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import UserRoles from 'src/backend/shared/constants/UserRoles';

export interface UserProjectPermission {
  _id: Types.ObjectId;
  id: Types.ObjectId | string;
  status: EntityStatus;
  firebaseId: string;
  projectId: Types.ObjectId | string;
  email: string;
  role: UserRoles;
  activateBy: Date;
  grantingAdmin: string;
  languages: LanguageEnum[];
  gender: GenderEnum;
  age: Date;
}

export interface ContextUserProjectPermission extends UserProjectPermission {
  triggerRefetch: () => void;
}
