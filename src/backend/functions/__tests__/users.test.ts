import { onCopyFirebaseUsers } from '../users';
import * as userController from '../../controllers/users';
import * as database from '../../utils/database';
import { FormattedUser } from '../../controllers/utils/interfaces';

const mockReferralCode = 'ABCD1234';

jest.mock('../utils', () => ({
  generateId: () => mockReferralCode,
}));

describe('users', () => {
  const mockDb = jest.spyOn(database, 'connectDatabase');
  const mockFindUsers = jest.spyOn(userController, 'findUsers');

  const fixtures = [
    {
      existingUsersMock: [{ id: '1' }, { id: '2' }, { id: '3' }],
      firebaseUsersMock: [{ id: '1' }, { id: '2' }, { id: '4' }, { id: '5' }],
      expectedUsers: [
        { firebaseId: '4', referralCode: mockReferralCode },
        { firebaseId: '5', referralCode: mockReferralCode },
      ],
      testCase: 'should copy 2 users to mongodb',
    },
    {
      existingUsersMock: [{ id: '1' }, { id: '2' }],
      firebaseUsersMock: [{ id: '1' }, { id: '2' }],
      expectedUsers: [],
      testCase: 'should copy 0 users to mongodb',
    },
  ];

  describe.each(fixtures)('onCopyFirebaseUsers', (fixture) => {
    it(fixture.testCase, async () => {
      // arrange
      const insetManyMock = jest.fn();

      mockDb.mockImplementationOnce(
        () =>
          Promise.resolve({
            model: () => ({
              find: () => fixture.existingUsersMock,
              insertMany: insetManyMock,
            }),
          }) as any,
      );

      mockFindUsers.mockResolvedValueOnce(fixture.firebaseUsersMock as FormattedUser[]);

      // act
      const result = await onCopyFirebaseUsers();

      // assert
      expect(result).toMatch('Successfully copied firebase users');
      expect(insetManyMock.mock.calls[0][0]).toHaveLength(fixture.expectedUsers.length);
      expect(insetManyMock).toBeCalledWith(fixture.expectedUsers);
    });
  });
});
