describe('Apartment Management System E2E Tests', () => {

  // This block runs before each test in this describe block
  beforeEach(() => {
    // Visits the root of the application
    cy.visit('/');
  });
//
  context('Login Flow', () => {
    it('admin login', () => {
        cy.get('#root input[type="text"]').click();
        cy.get('#root input[type="text"]').type('admin');
        cy.get('#root input[type="password"]').type('password');
        cy.get('#root button[type="submit"]').click();
        cy.url().should('include', '/home');
    });
  });
//
  context('Dashboard', () => {
    it('should display the main dashboard elements', () => {
        cy.get('#root button[tabindex="0"]').click();
        cy.get('#root h4').should('contain', 'Dashboard');
        cy.get('#root div.css-aqby9j').should('be.visible');
        cy.get('#root div:nth-child(2) > span').should('exist');
    });
  });
//
//   context('Data Manipulation (Placeholder)', () => {
//     // This is a placeholder for a test that creates and then deletes data.
//     // To implement this, you will need to provide the UI flows for these actions.
//     it.skip('should create new data and then delete it', () => {
//       // 1. Login
//       cy.get('button').contains('Login').click();
//       cy.url().should('include', '/home');
//
//       // 2. Navigate to the page for creating new data (e.g., a "Tenants" page)
//       // cy.get('a').contains('Tenants').click();
//       // cy.url().should('include', '/tenants');
//
//       // 3. Click a "Create New" button
//       // cy.get('button').contains('Create New').click();
//
//       // 4. Fill out the form for the new data
//       // cy.get('input[name="firstName"]').type('John');
//       // cy.get('input[name="lastName"]').type('Doe');
//       // ... fill out other fields
//
//       // 5. Submit the form
//       // cy.get('form').submit();
//
//       // 6. Verify that the new data is displayed on the page
//       // cy.contains('John Doe').should('be.visible');
//
//       // 7. Find the newly created data and click a "Delete" button
//       // cy.contains('John Doe').parent().find('button.delete-button').click();
//
//       // 8. Confirm the deletion
//       // cy.get('.confirmation-dialog').contains('Yes, delete').click();
//
//       // 9. Verify that the data is no longer visible
//       // cy.contains('John Doe').should('not.exist');
//     });
//   });
//
});

it('seeFirstFloor', function() {
  cy.visit('http://localhost:3000/')
  cy.get('#root input[type="text"]').click();
  cy.get('#root input[type="text"]').type('admin');
  cy.get('#root input[type="password"]').type('password');
  cy.get('#root button[type="submit"]').click();
  cy.get('[data-testid="MenuIcon"]').click();
  cy.get('li:nth-child(2) div[tabindex="0"] div span').click();
  cy.get('[data-testid="AddIcon"]').click();
  cy.get('input[placeholder="เช่น 101"]').click();
  cy.get('input[placeholder="เช่น 101"]').type('101');
  cy.get('div:nth-child(3) > button:nth-child(2)').click();
  cy.get('[data-testid="MenuIcon"]').click();
  cy.get('ul:nth-child(3) li:nth-child(1) div[tabindex="0"] div span').click();
  cy.get('#root div.css-1yjvs5a > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)').should('exist');
  cy.get('#root h5').should('contain', 'ชั้น 1');
  cy.get('#root div:nth-child(2) > span').should('contain', '1');
  cy.get('#root div:nth-child(4) span').should('contain', '1');
  cy.get('#root div.css-0 p:nth-child(1)').click();
  cy.get('#root div.css-1663ebo button').click();
  cy.get('div:nth-child(3) button:nth-child(1)').click();
});

it('seeSecondFloor', function() {
  cy.visit('http://localhost:3000/')
  cy.get('#root input[type="text"]').click();
  cy.get('#root input[type="text"]').type('admin');
  cy.get('#root input[type="password"]').type('password');
  cy.get('#root button[type="submit"]').click();
  cy.get('[data-testid="MenuIcon"]').click();
  cy.get('li:nth-child(2) div[tabindex="0"] div span').click();
  cy.get('#root div.css-j0ozid button').click();
  cy.get('input[placeholder="เช่น 101"]').click();
  cy.get('body').click();
  cy.get('#menu- li[tabindex="-1"]').click();
  cy.get('div:nth-child(3) > button:nth-child(2)').click();
  cy.get('#root button[aria-label="open drawer"]').click();
  cy.get('ul:nth-child(3) li:nth-child(1) div[tabindex="0"] div span').click();
  cy.get('#root div:nth-child(2) > span').should('contain','1');
  cy.get('#root div:nth-child(6) span').should('contain','1');
  cy.get('#root div.css-0 p:nth-child(1)').should('exist');
  cy.get('#root div.css-0 p:nth-child(1)').click();
  cy.get('#root div.css-1663ebo button').click();
  cy.get('div:nth-child(3) button:nth-child(1)').click();
});