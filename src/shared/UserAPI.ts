import { getAuth, updateProfile } from 'firebase/auth';
import { merge, pick } from 'lodash';
import { UserProfile } from 'src/backend/controllers/utils/interfaces';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import Collection from './constants/Collection';
import { request } from './utils/request';

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const { data: result } = await request({
    method: 'GET',
    url: `${Collection.USERS}/${userId}`,
  });
  return result;
};

export const updateUserProfile = async ({
  userId,
  userProfile,
}: {
  userId: string;
  userProfile: {
    displayName: string;
    age: Date;
    dialects: DialectEnum[];
    gender: GenderEnum;
  };
}): Promise<UserProfile> => {
  const auth = getAuth();
  const firebaseProfile = pick(userProfile, ['displayName']);
  await updateProfile(auth.currentUser, firebaseProfile);

  const { data: result } = await request({
    method: 'PUT',
    url: `${Collection.USERS}/${userId}`,
    data: userProfile,
  });
  return merge(userProfile, result);
};
