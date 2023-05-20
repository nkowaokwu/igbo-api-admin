export const FirebaseAuthProvider = jest.fn(() => ({
  login: jest.fn(async () => {}),
  logout: jest.fn(async () => {}),
  checkAuth: jest.fn(async () => {}),
  checkError: jest.fn(async () => {}),
  getIdentity: jest.fn(async () => {}),
  getPermissions: jest.fn(async () => {
    return { role: 'crowdsourcer' }
  }),
}));
