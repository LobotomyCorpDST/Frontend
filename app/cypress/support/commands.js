// cypress/support/commands.js

// -- Custom Commands for Apartment Management System --

// Command to bypass login and navigate directly to home
Cypress.Commands.add('bypassLogin', () => {
  cy.visit('/');
  cy.contains('Login').click();
  cy.url().should('include', '/home');
});

// Command to wait for API to be ready
// Cypress.Commands.add('waitForApi', () => {
//   cy.task('healthCheck').then((isHealthy) => {
//     if (!isHealthy) {
//       throw new Error('Backend API is not responding. Please ensure the Spring Boot server is running on port 8080.');
//     }
//   });
// });

// Command to clean up test data by type
Cypress.Commands.add('cleanupData', (dataType, ids) => {
  const apiEndpoints = {
    invoices: '/api/invoices',
    maintenance: '/api/maintenance',
    leases: '/api/leases',
    rooms: '/api/rooms',
    tenants: '/api/tenants'
  };

  if (apiEndpoints[dataType]) {
    ids.forEach(id => {
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('API_BASE_URL')}${apiEndpoints[dataType]}/${id}`,
        failOnStatusCode: false
      });
    });
  }
});

// Command to navigate using drawer menu labels
Cypress.Commands.add('navigateTo', (label) => {
  // Click the menu button to open the drawer
  cy.get('button[aria-label="open drawer"]').click();
  // **FIX:** Wait for the drawer to be visible before interacting with its contents
  cy.get('.MuiDrawer-paper').should('be.visible');
  // Click on the navigation link
  cy.contains(label).click();
});


// API helpers
Cypress.Commands.add('createTestRoom', (roomData) => {
  const defaultData = {
    number: Math.floor(Math.random() * 9000) + 1000,
    floor: 1,
    status: 'AVAILABLE'
  };
  return cy.request('POST', `${Cypress.env('API_BASE_URL')}/api/rooms`, { ...defaultData, ...roomData });
});

Cypress.Commands.add('createTestTenant', (tenantData) => {
  const defaultData = {
    name: 'Test Tenant',
    phone: '000-000-0000',
    lineId: 'test_line'
  };
  return cy.request('POST', `${Cypress.env('API_BASE_URL')}/api/tenants`, { ...defaultData, ...tenantData });
});

Cypress.Commands.add('createTestLease', (leaseData) => {
  const defaultData = {
    startDate: new Date().toISOString().split('T')[0],
    monthlyRent: 7000,
    depositBaht: 14000
  };
  return cy.request('POST', `${Cypress.env('API_BASE_URL')}/api/leases`, { ...defaultData, ...leaseData });
});

Cypress.Commands.add('createTestInvoice', (invoiceData) => {
  const today = new Date();
  const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const defaultData = {
    billingYear: today.getFullYear(),
    billingMonth: today.getMonth() + 1,
    issueDate: today.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    rentBaht: 7000
  };
  return cy.request('POST', `${Cypress.env('API_BASE_URL')}/api/invoices`, { ...defaultData, ...invoiceData });
});

Cypress.Commands.add('createTestMaintenance', (maintenanceData) => {
  const defaultData = {
    requestDate: new Date().toISOString().split('T')[0],
    description: 'Test maintenance request',
    status: 'PENDING'
  };
  return cy.request('POST', `${Cypress.env('API_BASE_URL')}/api/maintenance`, { ...defaultData, ...maintenanceData });
});