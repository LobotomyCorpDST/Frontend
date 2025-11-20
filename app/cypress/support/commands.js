// cypress/support/commands.js

// -- Custom Commands for Apartment Management System --

// Command to bypass login and navigate directly to home
Cypress.Commands.add('bypassLogin', () => {
  cy.visit('/');
  cy.get('[data-cy=login-username-input]').type('admin');
  cy.get('[data-cy=login-password-input]').type('1234');
  cy.get('[data-cy=login-submit-button]').click();
  cy.url().should('include', '/home');
  // Wait for dashboard to load
  cy.get('[data-cy=dashboard-title]', { timeout: 20000 }).should('be.visible');
});

// Command to wait for API to be ready (Check /health endpoint instead of protected api)
Cypress.Commands.add('waitForApi', () => {
  const apiBaseUrl = Cypress.env('API_BASE_URL') || 'https://apt.krentiz.dev/api';
  // Use /health because it is public. /api/rooms is protected and causes 403 error
  cy.request({
    method: 'GET',
    url: `${apiBaseUrl}/health`,
    failOnStatusCode: false,
    timeout: 10000
  }).then((response) => {
    if (response.status !== 200) {
      cy.log('Backend /health check failed or returned non-200');
    }
  });
});

// Command to clean up test data by type (With Auth Header)
Cypress.Commands.add('cleanupData', (dataType, ids) => {
  const apiBaseUrl = Cypress.env('API_BASE_URL') || 'https://apt.krentiz.dev/api';
  const apiEndpoints = {
    invoices: '/api/invoices',
    maintenance: '/api/maintenance',
    leases: '/api/leases',
    rooms: '/api/rooms',
    tenants: '/api/tenants'
  };

  if (apiEndpoints[dataType]) {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      ids.forEach(id => {
        cy.request({
          method: 'DELETE',
          url: `${apiBaseUrl}${apiEndpoints[dataType]}/${id}`,
          failOnStatusCode: false,
          headers: { Authorization: `Bearer ${token}` }
        });
      });
    });
  }
});

// Command to navigate using drawer menu labels
Cypress.Commands.add('navigateTo', (section) => {
  cy.get('button[aria-label="open drawer"]').click();
  cy.get('.MuiDrawer-paper', { timeout: 10000 }).should('be.visible');

  const sectionMap = {
    dashboard: 'สรุปภาพรวม',
    rooms: 'ห้องทั้งหมด',
    invoices: 'ใบแจ้งหนี้',
    maintenance: 'บำรุงรักษา',
    leaseHistory: 'ประวัติสัญญาเช่า',
    Dashboard: 'สรุปภาพรวม',
    'ห้องทั้งหมด': 'ห้องทั้งหมด',
    'ใบแจ้งหนี้': 'ใบแจ้งหนี้',
    'บำรุงรักษา': 'บำรุงรักษา',
    'ประวัติสัญญาเช่า': 'ประวัติสัญญาเช่า'
  };

  const targetText = sectionMap[section] || section;
  cy.get('.MuiDrawer-paper').contains(targetText).click();
  cy.get('.MuiDrawer-paper').should('not.be.visible');
});

// Helper to fill MUI TextField by label
Cypress.Commands.add('fillMuiField', (label, value) => {
  cy.get('body').then(() => {
    cy.contains('label', label).parent().find('input, textarea').first().clear().type(value);
  });
});

// Helper to select from MUI dropdown
Cypress.Commands.add('selectMuiDropdown', (label, value) => {
  cy.contains('label', label).parent().find('.MuiSelect-select').click();
  cy.get('.MuiMenuItem-root, [role="option"]', { timeout: 5000 }).contains(value).click();
});

// --- API Helpers with Authorization Header ---

Cypress.Commands.add('createTestRoom', (roomData) => {
  const apiBaseUrl = Cypress.env('API_BASE_URL') || 'https://apt.krentiz.dev/api';
  const defaultData = { number: Math.floor(Math.random() * 9000) + 1000, status: 'FREE' };

  return cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    return cy.request({
      method: 'POST',
      url: `${apiBaseUrl}/api/rooms`,
      body: { ...defaultData, ...roomData },
      failOnStatusCode: false,
      headers: { Authorization: `Bearer ${token}` }
    });
  });
});

Cypress.Commands.add('createTestInvoice', (invoiceData) => {
  const apiBaseUrl = Cypress.env('API_BASE_URL') || 'https://apt.krentiz.dev/api';
  const today = new Date();
  const defaultData = {
    billingYear: today.getFullYear(),
    billingMonth: today.getMonth() + 1,
    issueDate: today.toISOString().split('T')[0],
    dueDate: today.toISOString().split('T')[0],
    rentBaht: 7000,
    tenantId: 2
  };

  return cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    return cy.request({
      method: 'POST',
      url: `${apiBaseUrl}/api/invoices`,
      body: { ...defaultData, ...invoiceData },
      failOnStatusCode: false,
      headers: { Authorization: `Bearer ${token}` }
    });
  });
});

Cypress.Commands.add('createTestMaintenance', (maintenanceData) => {
  const apiBaseUrl = Cypress.env('API_BASE_URL') || 'https://apt.krentiz.dev/api';
  const defaultData = {
    description: 'Test maintenance task ' + Date.now(),
    scheduledDate: new Date().toISOString().split('T')[0],
    costBaht: 500
  };
  return cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    return cy.request({
      method: 'POST',
      url: `${apiBaseUrl}/api/maintenance`,
      body: { ...defaultData, ...maintenanceData },
      failOnStatusCode: false,
      headers: { Authorization: `Bearer ${token}` }
    });
  });
});

// Improved waitForTable
Cypress.Commands.add('waitForTable', () => {
  cy.get('.MuiTable-root, table', { timeout: 15000 }).should('be.visible');
});

// Helper to check OneOf
Cypress.Commands.add('shouldContainOneOf', { prevSubject: true }, (subject, expectedValues) => {
  const text = subject.text();
  const found = expectedValues.some(value => text.includes(value));
  expect(found, `Expected to find one of [${expectedValues.join(', ')}]`).to.be.true;
  return cy.wrap(subject);
});
