export const getAuth = jest.fn(() => ({
  currentUser: {
    getIdToken: jest.fn(async () => 'user-access'),
    displayName: 'Testing user',
  },
  useDeviceLanguage: jest.fn(),
}));

export const connectAuthEmulator = jest.fn();
export const GoogleAuthProvider = jest.fn().mockImplementation();
export const FacebookAuthProvider = jest.fn().mockImplementation();
export const EmailAuthProvider = jest.fn().mockImplementation();
export const signInWithPhoneNumber = jest.fn(async () => {
  return {
    verificationId: 'verificationId',
    confirm: jest.fn(),
  };
});

export class RecaptchaVerifier {}
