// cypress.config.js

const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // Base URL for the frontend application
    baseUrl: 'http://localhost:3000',
    
    // Environment variables for the tests
    env: {
      API_BASE_URL: 'http://localhost:8080',
    },
    
    // Recommended to keep test isolation on
    testIsolation: true,

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});