import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { AUTH_TOKEN } from 'src/__tests__/shared/constants';

export const getUserProjectPermissionHelper = jest.fn(() => ({
  status: EntityStatus.ACTIVE,
  firebaseId: AUTH_TOKEN.MERGER_AUTH_TOKEN,
  projectId: 'project-id',
  email: 'user@email.com',
  role: UserRoles.MERGER,
  activateBy: new Date(),
  grantingAdmin: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
  languages: [LanguageEnum.IGBO],
  gender: GenderEnum.FEMALE,
  age: new Date(),
}));
