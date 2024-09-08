import { requestFixture, responseFixture, nextFixture } from 'src/__tests__/shared/fixtures/requestFixtures';
import * as UserProjectPermissions from 'src/backend/controllers/userProjectPermissions';
import { userProjectPermissionFixture } from 'src/__tests__/shared/fixtures/userProjectPermissionFixtures';
import { projectFixture } from 'src/__tests__/shared/fixtures/projectFixtures';
import authentication from '../authentication';

jest.mock('firebase-admin');
jest.mock('../../controllers/userProjectPermissions');

describe('authentication', () => {
  it('authenticates the user', async () => {
    const req = requestFixture({ project: projectFixture(), headers: { authorization: 'Bearer uid-token' } });
    const res = responseFixture();
    const next = nextFixture();

    jest
      .spyOn(UserProjectPermissions, 'getUserProjectPermissionHelper')
      // @ts-expect-error
      .mockResolvedValue({ ...userProjectPermissionFixture(), toJSON: () => userProjectPermissionFixture() });

    await authentication(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('authenticates the user despite no userProjectPermission for Igbo API project', async () => {
    const req = requestFixture({
      project: projectFixture({ title: 'Igbo API' }),
      headers: { authorization: 'Bearer uid-token' },
    });
    const res = responseFixture();
    const next = nextFixture();

    jest.spyOn(UserProjectPermissions, 'getUserProjectPermissionHelper').mockResolvedValue(null);
    jest
      .spyOn(UserProjectPermissions, 'postUserProjectPermissionHelper')
      // @ts-expect-error
      .mockResolvedValue({ ...userProjectPermissionFixture(), toJSON: () => userProjectPermissionFixture() });

    await authentication(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('throws an error authenticating user that is not associated with project', async () => {
    const req = requestFixture({
      project: projectFixture({ id: 'different-project', title: 'Different project' }),
      headers: { authorization: 'Bearer uid-token' },
    });
    const res = responseFixture();
    const next = nextFixture();

    jest.spyOn(UserProjectPermissions, 'getUserProjectPermissionHelper').mockResolvedValue(null);

    await authentication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('throws error if malformed auth header', async () => {
    const req = requestFixture({
      headers: { authorization: 'Bearer' },
    });
    const res = responseFixture();
    const next = nextFixture();

    await authentication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
