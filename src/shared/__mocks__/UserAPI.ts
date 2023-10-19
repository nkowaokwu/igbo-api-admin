import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';

export const getUserProfile = jest.fn(async (uid: string) => ({
  displayName: uid.includes('merger') ? 'Merger Account' : uid.includes('editor') ? 'Editor Account' : 'Admin Account',
  uid,
  id: uid,
  email: `${uid.split('-')[0]}@example.come`,
  photoURL: '',
  role: uid.split('-'[0]),
  age: 18,
  dialects: [DialectEnum.ABI],
  gender: GenderEnum.FEMALE,
}));
