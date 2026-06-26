describe("ExpandTesting login page", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("logs in successfully with valid credentials", () => {
    cy.get("#username").should("be.visible").type("practice");
    cy.get("#password").should("be.visible").type("SuperSePassword!");
    cy.get("button[type='submit']").click();

    cy.location("pathname").should("eq", "/secure");
    cy.contains("You logged into a secure area!").should("be.visible");
    cy.contains("Logout").should("be.visible");
  });

  it("shows error for invalid username", () => {
    cy.get("#username").type("wrongUser");
    cy.get("#password").type("SuperSecretPassword!");
    cy.get("button[type='submit']").click();

    cy.location("pathname").should("eq", "/login");
    cy.contains("Invalid username.").should("be.visible");
  });

  it("shows error for invalid password", () => {
    cy.get("#username").type("practice");
    cy.get("#password").type("WrongPassword");
    cy.get("button[type='submit']").click();

    cy.location("pathname").should("eq", "/login");
    cy.contains("Invalid password.").should("be.visible");
  });
});