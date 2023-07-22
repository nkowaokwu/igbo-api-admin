const firebase: any = jest.createMockFromModule('firebase');

firebase.analytics = jest.fn().mockImplementation();
firebase.auth = jest.fn();
firebase.functions = jest.fn(() => ({
  httpsCallable: jest.fn(() => () => ({})),
  useEmulator: jest.fn(),
}));
firebase.firestore = jest.fn(() => ({
  db: {
    settings: jest.fn(),
  },
}));

export default firebase;
