import { getAuth, updateProfile } from 'firebase/auth';
import { camelCase, merge, pick } from 'lodash';
import network from 'src/Core/Dashboard/network';
import { UserProfile } from 'src/backend/controllers/utils/interfaces';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import StatTypes from 'src/backend/shared/constants/StatTypes';
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
  userProfile: Partial<{
    displayName: string;
    age: Date;
    dialects: DialectEnum[];
  }>;
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

export const getUserStats = async (): Promise<{ [key: string]: number }> => {
  const { body } = await network('/stats/full');
  const parsedBody: { [key in StatTypes]: { value: number } } = JSON.parse(body);

  const stats = Object.entries(parsedBody).reduce(
    (finalStats, [key, value]) => ({
      ...finalStats,
      [camelCase(key)]: value.value,
    }),
    {} as { [key: string]: number },
  );
  return stats;
};
