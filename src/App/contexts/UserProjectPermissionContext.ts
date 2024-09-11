import React from 'react';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import UserRoles from 'src/backend/shared/constants/UserRoles';

export const UserProjectPermissionContext = React.createContext({
  status: EntityStatus.UNSPECIFIED,
  firebaseId: '',
  projectId: '',
  email: '',
  role: UserRoles.USER,
  activateBy: new Date(),
  grantingAdmin: '',
  languages: [],
});
