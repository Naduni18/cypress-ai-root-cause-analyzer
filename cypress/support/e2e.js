Cypress.on("uncaught:exception", (err) => {
  cy.task("logConsoleError", `Uncaught exception: ${err.message}`);
  return false;
});

beforeEach(() => {
  cy.window().then((win) => {
    cy.stub(win.console, "error").callsFake((...args) => {
      cy.task("logConsoleError", args.join(" "));
    });
  });
});