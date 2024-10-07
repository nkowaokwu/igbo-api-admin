import React from 'react';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import UserRoles from 'src/backend/shared/constants/UserRoles';

export const UserProjectPermissionContext = React.createContext({
  _id: '',
  id: '',
  status: EntityStatus.UNSPECIFIED,
  firebaseId: '',
  projectId: '',
  email: '',
  role: UserRoles.USER,
  activateBy: new Date(),
  grantingAdmin: '',
  languages: [],
  gender: GenderEnum.UNSPECIFIED,
  age: new Date(),
  triggerRefetch: () => null,
});
