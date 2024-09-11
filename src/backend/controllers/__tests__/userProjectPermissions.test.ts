import {
  mongooseConnectionFixture,
  findOneMock,
  requestFixture,
  responseFixture,
  nextFixture,
  saveMock,
} from 'src/__tests__/shared/fixtures/requestFixtures';
import * as mongoose from 'mongoose';
import { userProjectPermissionFixture } from 'src/__tests__/shared/fixtures/userProjectPermissionFixtures';
import {
  getUserProjectPermission,
  getUserProjectPermissionHelper,
  postUserProjectPermission,
  postUserProjectPermissionHelper,
} from 'src/backend/controllers/userProjectPermissions';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';

jest.mock('mongoose');

describe('userProjectPermissions', () => {
  it('gets a user project permission with helper', async () => {
    jest.spyOn(mongoose, 'model').mockReturnValue({});
    const mongooseConnection = await mongooseConnectionFixture();
    const uid = 'uid';
    const projectId = 'projectId';

    await getUserProjectPermissionHelper({ mongooseConnection, uid, projectId });

    expect(findOneMock).toHaveBeenCalled();
  });

  it('finds one user permission project with uid and project id', async () => {
    const userProjectPermission = userProjectPermissionFixture();
    const req = requestFixture({
      query: { projectId: 'project-id' },
      user: { uid: 'uid' },
      findOne: { save: () => userProjectPermission },
    });
    const res = responseFixture();
    const next = nextFixture();

    await getUserProjectPermission(req, res, next);

    expect(res.send).toHaveBeenCalledWith({ userProjectPermission });
  });

  it('throws error while finding one user permission project due to not being found', async () => {
    jest.clearAllMocks();
    const req = requestFixture({
      query: { projectId: 'project-id' },
      user: { uid: 'uid' },
      findOne: null,
    });
    const res = responseFixture();
    const next = nextFixture();

    await getUserProjectPermission(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('posts a new user project permission with helper', async () => {
    jest.spyOn(mongoose, 'model').mockReturnValue({});
    const mongooseConnection = await mongooseConnectionFixture();
    const projectId = 'projectId';
    const body = {
      email: 'email@email.com',
      role: UserRoles.EDITOR,
      firebaseId: 'uid',
      grantingAdmin: 'admin-uid',
    };

    await postUserProjectPermissionHelper({ mongooseConnection, projectId, body });

    expect(saveMock).toHaveBeenCalled();
  });

  it('posts a new user project permission', async () => {
    const req = requestFixture({
      user: { uid: 'admin-uid' },
      findOne: null,
      body: {
        projectId: 'project-id',
        uid: 'uid',
        email: 'email@email.com',
        role: UserRoles.EDITOR,
      },
    });
    const res = responseFixture();
    const next = nextFixture();

    await postUserProjectPermission(req, res, next);

    expect(res.send).toHaveBeenCalledWith({
      userProjectPermission: {
        firebaseId: '',
        email: 'email@email.com',
        grantingAdmin: 'admin-uid',
        projectId: 'project-id',
        role: UserRoles.EDITOR,
        status: EntityStatus.ACTIVE,
      },
    });
  });

  it('throws an error when posting a new user project permission', async () => {
    const userProjectPermission = userProjectPermissionFixture();
    const req = requestFixture({
      user: { uid: 'admin-uid' },
      findOne: userProjectPermission,
      body: {
        projectId: 'project-id',
        uid: 'uid',
        email: 'email@email.com',
        role: UserRoles.EDITOR,
      },
    });
    const res = responseFixture();
    const next = nextFixture();

    await postUserProjectPermission(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
