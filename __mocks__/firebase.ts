const firebase: any = jest.createMockFromModule('firebase');

firebase.analytics = jest.fn().mockImplementation();
firebase.auth = jest.fn(() => ({}));
firebase.functions = jest.fn(() => ({
  httpsCallable: jest.fn(() => () => ({})),
  useEmulator: jest.fn(() => ({})),
}));
firebase.firestore = jest.fn(() => ({
  db: {
    settings: jest.fn(() => ({})),
  }
}));
firebase.auth.GoogleAuthProvider = jest.fn().mockImplementation();
firebase.auth.FacebookAuthProvider = jest.fn().mockImplementation();
firebase.auth.EmailAuthProvider = jest.fn().mockImplementation();

export default firebase;
