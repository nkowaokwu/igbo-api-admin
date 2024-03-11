module.exports = {
  displayName: 'igbo-api-admin',
  testMatch: ['./**/__tests__/*.tsx'],
  testTimeout: 20000,
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['src/__tests__/*.tsx'],
  moduleFileExtensions: ['tsx', 'ts', 'js', 'json', 'html'],
  coverageDirectory: '../../coverage/apps/functions',
  moduleNameMapper: {
    '^[./a-zA-Z0-9$_-]+\\.(svg|gif|png|less|css)$': '<rootDir>/src/__data__/assetStub.ts',
  },
  setupFilesAfterEnv: ['./src/__tests__/shared/script.ts'],
  modulePathIgnorePatterns: ['<rootDir>/functions/'],
};
