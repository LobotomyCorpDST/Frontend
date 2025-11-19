// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://apt.krentiz.dev',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      API_BASE_URL: 'https://apt.krentiz.dev/api'
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
