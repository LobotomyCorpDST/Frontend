// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://35.185.182.150',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      API_BASE_URL: 'http://34.87.82.168:8080/'
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false, // Disable video recording for faster tests
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000, // Increase timeout for slow loading elements
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    // Retry settings
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
});
