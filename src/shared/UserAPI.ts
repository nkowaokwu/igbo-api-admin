import { getAuth, updateProfile } from 'firebase/auth';
import { FormattedUser } from 'src/backend/controllers/utils/interfaces';
import Collection from './constants/Collection';
import { request } from './utils/request';

export const getUserProfile = async (userId: string): Promise<FormattedUser> => {
  const { data: result } = await request({
    method: 'GET',
    url: `${Collection.USERS}/${userId}`,
  });
  return result;
};

export const updateUserProfile = async (userProfile: { displayName: string }): Promise<boolean> => {
  const auth = getAuth();
  await updateProfile(auth.currentUser, userProfile);
  return true;
};
