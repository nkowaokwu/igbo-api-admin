const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['./**/__tests__/*.tsx'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['src/__tests__/*.tsx'],
  moduleNameMapper: {
    '^[./a-zA-Z0-9$_-]+\\.(svg|gif|png|less|css)$': '<rootDir>/src/__data__/assetStub.ts',
  },
};
