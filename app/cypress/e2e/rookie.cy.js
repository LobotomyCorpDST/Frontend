describe('Apartment Management System E2E Tests', () => {

  beforeEach(() => {
    cy.visit('/');
  });

  context('Login Flow', () => {
    it('should bypass the login page on button click', () => {
      cy.get('[data-cy=login-username-input]').type('admin');
      cy.get('[data-cy=login-password-input]').type('1234');
      cy.get('[data-cy=login-submit-button]').click();

      cy.url().should('include', '/home');
    });
  });

  context('Dashboard', () => {
    it('should display the main dashboard elements', () => {
      cy.get('[data-cy=login-username-input]').type('admin');
      cy.get('[data-cy=login-password-input]').type('1234');
      cy.get('[data-cy=login-submit-button]').click();

      cy.url().should('include', '/home');

      cy.get('[data-cy="dashboard-stats-container"]').should('be.visible');
      cy.get('[data-cy="dashboard-floors-container"]').should('exist');
      cy.contains('จำนวนห้องทั้งหมด').should('be.visible');
    });
  });

  context('Data Manipulation (Placeholder)', () => {
    it.skip('should create new data and then delete it', () => {
      // Placeholder skipped
    });
  });
});
