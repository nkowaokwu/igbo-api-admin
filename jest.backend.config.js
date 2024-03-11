module.exports = {
  displayName: 'igbo-api-admin',
  testMatch: ['./**.test.ts'],
  testTimeout: 20000,
  testEnvironment: 'node',
  moduleFileExtensions: ['tsx', 'ts', 'js', 'json', 'html'],
  coverageDirectory: '../../coverage/apps/functions',
  setupFilesAfterEnv: ['./src/__tests__/shared/script.ts'],
  modulePathIgnorePatterns: ['<rootDir>/functions/'],
};
