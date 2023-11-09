import { getReferralCode } from '../CrowdsourcerAPI';
import * as request from '../utils/request';

const mockRequest = jest.spyOn(request, 'request');

describe('CrowdsourcerAPI', () => {
  describe('getReferralCode', () => {
    it('should call request client with correct params', async () => {
      // arrange
      const referralCode = 'awesome-referral-code';
      mockRequest.mockResolvedValueOnce({ data: { referralCode } } as any);

      // act
      const response = await getReferralCode();

      // assert
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'users/referral',
      });
      expect(response).toEqual(referralCode);
    });
  });
});
