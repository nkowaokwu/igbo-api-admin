module.exports = {
  displayName: 'igbo-api-admin',
  testMatch: ['./**.test.ts'],
  testTimeout: 20000,
  testEnvironment: 'node',
  moduleFileExtensions: ['tsx', 'ts', 'js', 'json', 'html'],
  coverageDirectory: '../../coverage/apps/functions',
  moduleNameMapper: {
    '^[./a-zA-Z0-9$_-]+\\.(json)$': '<rootDir>/src/__data__/assetStub.ts',
  },
  setupFilesAfterEnv: ['./src/__tests__/shared/script.ts'],
};
