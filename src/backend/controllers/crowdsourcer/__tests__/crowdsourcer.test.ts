import { findReferralCode } from '..';
import * as utils from '../../utils';

const handleQueriesMock = jest.spyOn(utils, 'handleQueries');

describe('crowdsourcer', () => {
  const findOneMock = jest.fn();
  const userId = 'awesome-user-id';
  const mockRequest = {
    mongooseConnection: {
      model: () => ({
        findOne: findOneMock,
      }),
    },
    user: {
      uid: userId,
    },
  } as any;

  const mockResponse = {
    send: jest.fn(),
  } as any;

  describe('findReferralCode', () => {
    it('should find a user document and return relevant properties', async () => {
      // arrange
      const crowdsourcer = {
        __v: 0,
        _id: 'awesome-id',
        createdAt: '2023-10-10T14:22:44.561Z',
        firebaseId: 'awesome-fireabse-id',
        referralCode: 'awesome-referral-code',
        updatedAt: '2023-10-10T14:22:44.561Z',
      };
      handleQueriesMock.mockReturnValueOnce(mockRequest);
      findOneMock.mockResolvedValueOnce(crowdsourcer);

      // act
      await findReferralCode(mockRequest, mockResponse);

      // assert
      expect(findOneMock).toHaveBeenCalledWith({ firebaseId: userId });
      expect(mockResponse.send).toBeCalledWith({
        firebaseId: 'awesome-fireabse-id',
        referralCode: 'awesome-referral-code',
      });
    });
  });
});
