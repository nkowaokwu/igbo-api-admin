import { defineConfig } from 'cypress';

export default defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  retries: 0,
  screenshotOnRunFailure: false,
  video: false,
  videoUploadOnPasses: false,
  viewportHeight: 960,
  viewportWidth: 1536,
  numTestsKeptInMemory: 1,

  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.ts')(on, config);
    },
    baseUrl: 'http://localhost:3030',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    testIsolation: false,
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
});
