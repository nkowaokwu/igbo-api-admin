import { cloneDeep } from 'lodash';
import { UserProjectPermission } from 'src/backend/controllers/utils/interfaces';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import UserRoles from 'src/backend/shared/constants/UserRoles';

export const userProjectPermissionFixture = (data?: Partial<UserProjectPermission>) => ({
  id: '',
  status: EntityStatus.ACTIVE,
  firebaseId: '',
  projectId: '',
  email: '',
  role: UserRoles.EDITOR,
  activatedBy: new Date(),
  grantingAdmin: '',
  ...cloneDeep(data),
});
