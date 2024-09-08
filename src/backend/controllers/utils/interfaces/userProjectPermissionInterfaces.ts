import { Types } from 'mongoose';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import UserRoles from 'src/backend/shared/constants/UserRoles';

export interface UserProjectPermission {
  id: Types.ObjectId | string;
  status: EntityStatus;
  firebaseId: string;
  projectId: Types.ObjectId | string;
  email: string;
  role: UserRoles;
  activateBy: Date;
  grantingAdmin: string;
}
