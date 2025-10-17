describe('Apartment Management System E2E Tests', () => {

  // This block runs before each test in this describe block
  beforeEach(() => {
    // Visits the root of the application
    cy.visit('/');
  });

  context('Login Flow', () => {
    it('should bypass the login page on button click', () => {
      // Assuming your login button has a unique identifier like 'login-button'
      // If not, you can use other selectors like the button text
      cy.get('button').contains('Login').click();

      // After clicking login, the URL should change to the dashboard page
      // Replace '/dashboard' with the actual path to your dashboard
      cy.url().should('include', '/home');
    });
  });

  context('Dashboard', () => {
    it('should display the main dashboard elements', () => {
      // First, perform the login action to get to the dashboard
      cy.get('button').contains('Login').click();
      cy.url().should('include', '/home');

      // Now, check for the presence of key elements on the dashboard
      // Replace these selectors with the actual selectors for your dashboard elements
      cy.get('h1').should('contain', 'Home'); // Checks for a heading with the text "Dashboard"
      cy.get('.some-container-class').should('be.visible'); // Checks for a visible container
      cy.get('[data-testid="some-element"]').should('exist'); // Checks for an element with a specific data-testid attribute
    });
  });

  context('Data Manipulation (Placeholder)', () => {
    // This is a placeholder for a test that creates and then deletes data.
    // To implement this, you will need to provide the UI flows for these actions.
    it.skip('should create new data and then delete it', () => {
      // 1. Login
      cy.get('button').contains('Login').click();
      cy.url().should('include', '/home');

      // 2. Navigate to the page for creating new data (e.g., a "Tenants" page)
      // cy.get('a').contains('Tenants').click();
      // cy.url().should('include', '/tenants');

      // 3. Click a "Create New" button
      // cy.get('button').contains('Create New').click();

      // 4. Fill out the form for the new data
      // cy.get('input[name="firstName"]').type('John');
      // cy.get('input[name="lastName"]').type('Doe');
      // ... fill out other fields

      // 5. Submit the form
      // cy.get('form').submit();

      // 6. Verify that the new data is displayed on the page
      // cy.contains('John Doe').should('be.visible');

      // 7. Find the newly created data and click a "Delete" button
      // cy.contains('John Doe').parent().find('button.delete-button').click();

      // 8. Confirm the deletion
      // cy.get('.confirmation-dialog').contains('Yes, delete').click();

      // 9. Verify that the data is no longer visible
      // cy.contains('John Doe').should('not.exist');
    });
  });

});