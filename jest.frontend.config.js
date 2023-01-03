module.exports = {
  displayName: 'igbo-api-admin',
  testMatch: ['./**/__tests__/*.tsx'],
  testTimeout: 20000,
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['src/__tests__/*.tsx'],
  moduleFileExtensions: ['tsx', 'ts', 'js', 'json', 'html'],
  coverageDirectory: '../../coverage/apps/functions',
  setupFilesAfterEnv: ['./src/__tests__/shared/script.ts'],
};
