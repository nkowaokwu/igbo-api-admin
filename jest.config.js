module.exports = {
  displayName: 'igbo-api-admin',
  testMatch: ['**/__tests__/*.tsx', '**/__tests__/*.ts'],
  testTimeout: 20000,
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['tsx', 'ts', 'js', 'json', 'html'],
  coverageDirectory: '../../coverage/apps/functions',
  setupFilesAfterEnv: ['./src/__tests__/shared/script.ts'],
};
