import { dropMongoDBCollections } from 'src/__tests__/shared';
import { createReferral } from '../crowdsourcer';
import * as utils from '../../utils';

const handleQueriesMock = jest.spyOn(utils, 'handleQueries');

describe('crowdsourcer', () => {
  const findOneMock = jest.fn();
  const createMock = jest.fn();
  const userId = 'awesome-user-id';
  const referralCode = 'awesome-referral-code';
  const mockRequest = {
    mongooseConnection: {
      model: () => ({
        findOne: findOneMock,
        create: createMock,
      }),
    },
    referralCode,
    user: {
      uid: userId,
    },
  } as any;

  const sendMock = jest.fn();
  const mockResponse = {
    send: sendMock,
    status: jest.fn(() => mockResponse),
  } as any;
  const mockNext = jest.fn();

  beforeEach(async () => {
    await dropMongoDBCollections();
  });

  describe('createReferral', () => {
    // arrange
    const referrer = {
      firebaseId: 'awesome-referrer-id',
    };
    const referredUser = {
      firebaseId: 'awesome-referred-user-id',
    };

    it('should create a referral', async () => {
      // arrange
      handleQueriesMock.mockReturnValueOnce(mockRequest);
      findOneMock.mockResolvedValueOnce(referrer);
      findOneMock.mockResolvedValueOnce(referredUser);
      findOneMock.mockResolvedValueOnce(null);

      // act
      await createReferral(mockRequest, mockResponse, mockNext);

      // assert
      expect(findOneMock).toHaveBeenNthCalledWith(1, { referralCode });
      expect(findOneMock).toHaveBeenNthCalledWith(2, { firebaseId: userId });
      expect(findOneMock).toHaveBeenNthCalledWith(3, { referredUserId: referredUser.firebaseId });
      expect(createMock).toHaveBeenCalledWith({
        referredUserId: referredUser.firebaseId,
        referrerId: referrer.firebaseId,
      });
      expect(sendMock).toHaveBeenCalledWith({
        message: 'Referral successful',
      });
    });
    it('should respond with a 503 if auth user has previously been referred', async () => {
      // arrange
      handleQueriesMock.mockReturnValueOnce(mockRequest);
      findOneMock.mockResolvedValueOnce(referrer);
      findOneMock.mockResolvedValueOnce(referredUser);
      findOneMock.mockResolvedValueOnce(referredUser);

      // act
      await createReferral(mockRequest, mockResponse, mockNext);

      // assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(sendMock).toHaveBeenCalledWith({
        error: `Users cannot be referred twice. Referral code ${referralCode} will be ignored`,
      });
    });
  });
});
