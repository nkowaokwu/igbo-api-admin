import { anyRoles, mergerRoles } from 'src/backend/shared/constants/RolePermissions';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { requestFixture, responseFixture, nextFixture } from 'src/__tests__/shared/fixtures/requestFixtures';
import authorization from '../authorization';

describe('authorization', () => {
  it('throws error due to no user object', async () => {
    const req = requestFixture();
    const res = responseFixture();
    const next = nextFixture();

    await authorization(anyRoles)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('authorizes the user as an official application', async () => {
    const req = requestFixture({ user: {}, get: () => 'main_key' });
    const res = responseFixture();
    const next = nextFixture();

    await authorization(anyRoles)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('throws an error for a user with no api key', async () => {
    const req = requestFixture({ user: {}, get: () => '' });
    const res = responseFixture();
    const next = nextFixture();

    await authorization(anyRoles)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('throws an error for a user with no uid', async () => {
    const req = requestFixture({ user: {}, get: () => '' });
    const res = responseFixture();
    const next = nextFixture();

    await authorization(anyRoles)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('authorizes user with matching permissions', async () => {
    const req = requestFixture({ user: { uid: 'uid', role: UserRoles.MERGER }, get: () => '' });
    const res = responseFixture();
    const next = nextFixture();

    await authorization(mergerRoles)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('throw error with mismatching permissions', async () => {
    const req = requestFixture({ user: { uid: 'uid', role: UserRoles.EDITOR }, get: () => '' });
    const res = responseFixture();
    const next = nextFixture();

    await authorization(mergerRoles)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('authorizes user as admin', async () => {
    const req = requestFixture({ user: { uid: 'uid', role: UserRoles.ADMIN }, get: () => '' });
    const res = responseFixture();
    const next = nextFixture();

    await authorization(mergerRoles)(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
