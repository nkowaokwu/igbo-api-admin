import { allUsers } from '../src/__tests__/__mocks__/user_data';

export const firestore = jest.fn(() => ({
  doc: jest.fn(),
  settings: jest.fn(),
}));
export const auth = jest.fn(() => ({
  listUsers: jest.fn(async () => ({ users: allUsers })),
  getUser: jest.fn(async (uid: string) => allUsers.find(({ uid: userId }) => userId === uid)),
}));
export const credential = {
  cert: jest.fn(),
};
export const initializeApp = jest.fn();
