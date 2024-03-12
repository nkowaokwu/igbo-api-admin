const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['./**.test.ts'],
  testEnvironment: 'node',
};
