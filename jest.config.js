module.exports = {
  displayName: 'igbo-api-admin',
  testTimeout: 20000,
  moduleFileExtensions: ['tsx', 'ts', 'js', 'jsx', 'json', 'html'],
  coverageDirectory: '../../coverage/apps/functions',
  setupFiles: ['./src/__tests__/shared/setupFiles.ts'],
  setupFilesAfterEnv: ['./src/__tests__/shared/setupFilesAfterEnv.ts'],
  modulePathIgnorePatterns: ['<rootDir>/functions/'],
};
