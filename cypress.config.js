const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://practice.expandtesting.com",
    specPattern: "cypress/e2e/**/*.cy.js",
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    reporter: "mocha-junit-reporter",
    reporterOptions: {
      mochaFile: "cypress/results/junit-[hash].xml",
      toConsole: true
    },
    setupNodeEvents(on, config) {
      on("task", {
        logConsoleError(message) {
          console.error("[browser-console-error]", message);
          return null;
        }
      });

      return config;
    }
  }
});