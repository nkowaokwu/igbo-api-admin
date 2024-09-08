import moment from 'moment';
import {
  findAdminUsers,
  findPermittedUserEmails,
  findPermittedUsers,
  findUser,
  findUsers,
  formatUser,
  getUser,
  getUserProfile,
  getUsers,
  putUserProfile,
} from 'src/backend/controllers/users';
import { Crowdsourcer, FormattedUser } from 'src/backend/controllers/utils/interfaces';
import { crowdsourcerSchema } from 'src/backend/models/Crowdsourcer';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import cleanDocument from 'src/backend/shared/utils/cleanDocument';
import { connectDatabase } from 'src/backend/utils/database';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import { AUTH_TOKEN } from 'src/__tests__/shared/constants';
import { allUsers, defaultAdminUser, defaultEditorUser, defaultMergerUser } from 'src/__tests__/__mocks__/user_data';

const adminUid = AUTH_TOKEN.ADMIN_AUTH_TOKEN;

describe('Users', () => {
  beforeEach(async () => {
    // Clear out database to start with a clean slate
    await dropMongoDBCollections();
  });

  it('formats the user object', () => {
    const lastSignInTime = new Date();
    const creationTime = new Date();
    const unformattedUser = {
      uid: 'uid',
      photoURL: 'photoURL',
      email: 'email@example.com',
      displayName: 'Full name',
      customClaims: { role: UserRoles.ADMIN },
      metadata: { lastSignInTime, creationTime },
      emailVerified: false,
      disabled: false,
      providerData: null,
      toJSON: () => null,
    };
    // @ts-expect-error
    expect(formatUser(unformattedUser)).toEqual({
      uid: unformattedUser.uid,
      id: unformattedUser.uid,
      photoURL: unformattedUser.photoURL,
      email: unformattedUser.email,
      displayName: unformattedUser.displayName,
      role: unformattedUser.customClaims.role,
      lastSignInTime,
      creationTime,
    });
  });

  it('finds all users', async () => {
    const users = await findUsers();
    const finalUsers = allUsers.map(
      // @ts-expect-error
      formatUser,
    );
    expect(users).toEqual(finalUsers);
  });

  it('finds all admin users', async () => {
    const adminUsers = await findAdminUsers();
    // @ts-expect-error
    const finalUsers = [defaultAdminUser].map(formatUser);
    expect(adminUsers).toEqual(finalUsers);
  });

  it('finds all admin users emails', async () => {
    const adminUserEmails = (await findAdminUsers()).map(({ email }) => email);
    const finalAdminEmails = [defaultAdminUser.email];
    expect(adminUserEmails).toEqual(finalAdminEmails);
  });

  it('finds all permitted users', async () => {
    const permittedUsers = await findPermittedUsers();
    // @ts-expect-error
    const finalPermittedUsers = [defaultAdminUser, defaultMergerUser, defaultEditorUser].map(formatUser);
    expect(permittedUsers).toEqual(finalPermittedUsers);
  });

  it('finds all permitted users emails', async () => {
    const permittedUserEmails = await findPermittedUserEmails();
    const finalPermittedUsers = [defaultAdminUser, defaultMergerUser, defaultEditorUser].map(({ email }) => email);
    expect(permittedUserEmails).toEqual(finalPermittedUsers);
  });

  it('gets users with skip and limit', async () => {
    const sendMock = jest.fn();
    const mockReq = {
      query: { skip: 0, limit: 10 },
    };
    const mockRes = {
      setHeader: () => ({
        status: () => ({
          send: sendMock,
        }),
      }),
    };
    const mockNext = jest.fn();
    await getUsers(mockReq, mockRes, mockNext);
    const users = allUsers.map(formatUser);
    expect(sendMock).toHaveBeenCalledWith(users);
  });

  it('gets a user with the uid', async () => {
    const sendMock = jest.fn();
    const mockReq = {
      params: { uid: adminUid },
    };
    const mockRes = {
      status: () => ({
        send: sendMock,
      }),
    };
    const mockNext = jest.fn();
    await getUser(mockReq, mockRes, mockNext);
    // @ts-expect-error
    expect(sendMock).toHaveBeenCalledWith(formatUser(defaultAdminUser));
  });

  it('finds a user', async () => {
    const user = (await findUser(adminUid)) as FormattedUser;
    expect(user.uid).toEqual(adminUid);
  });

  it('gets the user profile', async () => {
    const mongooseConnection = await connectDatabase();
    const Crowdsourcer = mongooseConnection.model<Crowdsourcer>('Crowdsourcer', crowdsourcerSchema);
    const crowdsourcer = new Crowdsourcer({
      firebaseId: adminUid,
      referralCode: '',
      age: moment().toDate(),
      dialects: [],
      gender: GenderEnum.FEMALE,
    });
    const savedCrowdsourcer = cleanDocument((await crowdsourcer.save()).toJSON());

    const sendMock = jest.fn();
    const mockReq = {
      params: { uid: adminUid },
      user: { uid: adminUid },
      mongooseConnection,
    };
    const mockRes = {
      status: () => ({
        send: sendMock,
      }),
    };
    const mockNext = jest.fn();
    await getUserProfile(mockReq, mockRes, mockNext);
    expect(sendMock.mock.calls[0][0]).toMatchObject({
      ...formatUser(defaultAdminUser),
      ...savedCrowdsourcer,
      id: defaultAdminUser.id,
    });
  });

  it('puts the user profile', async () => {
    const mongooseConnection = await connectDatabase();
    const sendMock = jest.fn();
    const age = moment().toDate();
    const Crowdsourcer = mongooseConnection.model<Crowdsourcer>('Crowdsourcer', crowdsourcerSchema);
    const crowdsourcer = new Crowdsourcer({
      firebaseId: adminUid,
      referralCode: '',
      age,
      dialects: [],
      gender: GenderEnum.FEMALE,
    });
    const savedCrowdsourcer = cleanDocument((await crowdsourcer.save()).toJSON());
    const updatedCrowdsourcer = {
      age,
      dialects: [DialectEnum.ACH],
      gender: GenderEnum.MALE,
    };

    const mockReq = {
      user: { uid: adminUid },
      mongooseConnection,
      body: updatedCrowdsourcer,
    };
    const mockRes = {
      status: () => ({
        send: sendMock,
      }),
    };
    const mockNext = jest.fn();

    await putUserProfile(mockReq, mockRes, mockNext);
    expect(sendMock).toHaveBeenCalledWith({
      ...savedCrowdsourcer,
      ...updatedCrowdsourcer,
    });
  });
});
