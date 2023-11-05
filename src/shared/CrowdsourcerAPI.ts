import { Crowdsourcer } from 'src/backend/controllers/utils/interfaces';
import Collection from './constants/Collection';
import { request } from './utils/request';

export const getReferralCode = async () => {
  const {
    data: { referralCode },
  } = await request<Crowdsourcer>({
    method: 'GET',
    url: `${Collection.USERS}/referral`,
  });

  return referralCode;
};
