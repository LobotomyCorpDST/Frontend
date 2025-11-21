const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    defaultCommandTimeout: 10000,
    baseUrl: 'https://apt.krentiz.dev',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
