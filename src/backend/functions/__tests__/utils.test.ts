import UserRoles from 'src/backend/shared/constants/UserRoles';
import { assignUserRole } from '../utils';

describe('utils', () => {
  it('assigns the user role of admin', () => {
    const user = { email: 'admin@example.com' };

    expect(assignUserRole(user)).toEqual({ role: UserRoles.ADMIN });
  });
});
