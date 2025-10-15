// cypress/support/commands.js

// -- Custom Commands for Apartment Management System --

// Command to bypass login and navigate directly to home
Cypress.Commands.add('bypassLogin', () => {
  cy.visit('/');
  cy.get('button').contains('Login').click();
  cy.url().should('include', '/home');
  // Wait for dashboard to load
  cy.get('h4').contains('Dashboard').should('be.visible');
});

// Command to wait for API to be ready
Cypress.Commands.add('waitForApi', () => {
  cy.request({
    url: `${Cypress.env('API_BASE_URL')}/api/rooms/ping`,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error('Backend API is not responding. Please ensure the Spring Boot server is running on port 8080.');
    }
  });
});

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

// Command to navigate using drawer menu labels (Thai text from Home.js)
Cypress.Commands.add('navigateTo', (section) => {
  // Click the menu button to open the drawer
  cy.get('button[aria-label="open drawer"]').click();
  
  // Wait for the drawer to be visible
  cy.get('.MuiDrawer-paper').should('be.visible');
  
  // Map section names to actual Thai text used in the app
  const sectionMap = {
    'dashboard': 'Dashboard',
    'rooms': 'ห้องทั้งหมด',
    'invoices': 'ใบแจ้งหนี้',
    'maintenance': 'บำรุงรักษา',
    'leaseHistory': 'ประวัติสัญญาเช่า',
    // English alternatives for convenience
    'Dashboard': 'Dashboard',
    'ห้องทั้งหมด': 'ห้องทั้งหมด',
    'ใบแจ้งหนี้': 'ใบแจ้งหนี้',
    'บำรุงรักษา': 'บำรุงรักษา',
    'ประวัติสัญญาเช่า': 'ประวัติสัญญาเช่า'
  };
  
  const targetText = sectionMap[section] || section;
  
  // Click on the navigation item
  cy.get('.MuiDrawer-paper').contains(targetText).click();
  
  // Wait for drawer to close
  cy.get('.MuiDrawer-paper').should('not.be.visible');
});

// Command to open a modal/dialog by button text
Cypress.Commands.add('openModal', (buttonText) => {
  cy.get('button').contains(buttonText).click();
  cy.get('.MuiDialog-root').should('be.visible');
});

// Command to close modal/dialog
Cypress.Commands.add('closeModal', () => {
  cy.get('.MuiDialog-root').should('be.visible');
  // Try different ways to close modal
  cy.get('body').then(($body) => {
    if ($body.find('button:contains("Cancel")').length) {
      cy.get('button').contains('Cancel').click();
    } else if ($body.find('button:contains("ยกเลิก")').length) {
      cy.get('button').contains('ยกเลิก').click();
    } else {
      // Click outside modal or press Escape
      cy.get('.MuiBackdrop-root').click({ force: true });
    }
  });
  cy.get('.MuiDialog-root').should('not.exist');
});

// Fixed command to fill MUI TextField by label
Cypress.Commands.add('fillMuiField', (label, value) => {
  cy.get('.MuiFormControl-root').contains('label', label).parent().find('input').clear().type(value);
});

// Fixed command to select from MUI dropdown
Cypress.Commands.add('selectMuiDropdown', (label, value) => {
  cy.get('.MuiFormControl-root').contains('label', label).parent().find('.MuiSelect-select').click();
  cy.get('.MuiMenuItem-root').contains(value).click();
});

// API helper commands
Cypress.Commands.add('createTestRoom', (roomData) => {
  const defaultData = {
    number: Math.floor(Math.random() * 9000) + 1000,
    status: 'FREE'
  };
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('API_BASE_URL')}/api/rooms`,
    body: { ...defaultData, ...roomData },
    failOnStatusCode: false
  });
});

Cypress.Commands.add('createTestTenant', (tenantData) => {
  const defaultData = {
    name: 'Test Tenant ' + Date.now(),
    phone: '000-000-0000',
    lineId: 'test_line_' + Date.now()
  };
  return cy.request('POST', `${Cypress.env('API_BASE_URL')}/api/tenants`, { 
    ...defaultData, 
    ...tenantData 
  });
});

Cypress.Commands.add('createTestLease', (leaseData) => {
  const defaultData = {
    startDate: new Date().toISOString().split('T')[0],
    monthlyRent: 7000,
    depositBaht: 14000
  };
  return cy.request('POST', `${Cypress.env('API_BASE_URL')}/api/leases`, { 
    ...defaultData, 
    ...leaseData 
  });
});

Cypress.Commands.add('createTestInvoice', (invoiceData) => {
  const today = new Date();
  const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const defaultData = {
    billingYear: today.getFullYear(),
    billingMonth: today.getMonth() + 1,
    issueDate: today.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    rentBaht: 7000,
    tenantId: 2 // Include tenantId to avoid API errors
  };
  return cy.request('POST', `${Cypress.env('API_BASE_URL')}/api/invoices`, { 
    ...defaultData, 
    ...invoiceData 
  });
});

Cypress.Commands.add('createTestMaintenance', (maintenanceData) => {
  const defaultData = {
    description: 'Test maintenance task ' + Date.now(),
    scheduledDate: new Date().toISOString().split('T')[0],
    costBaht: 500
  };
  return cy.request('POST', `${Cypress.env('API_BASE_URL')}/api/maintenance`, { 
    ...defaultData, 
    ...maintenanceData 
  });
});

// Command to wait for table/list to load
Cypress.Commands.add('waitForTable', () => {
  cy.get('.MuiTable-root, .room-table, .invoice-table').should('be.visible');
});

// Command to find row in table by content
Cypress.Commands.add('findTableRow', (content) => {
  return cy.get('tr').contains(content).parent('tr');
});

// Command to click tab by text
Cypress.Commands.add('clickTab', (tabText) => {
  cy.get('.MuiTab-root').contains(tabText).click();
});

// Command to wait for page load by checking for specific content
Cypress.Commands.add('waitForPageLoad', (expectedContent) => {
  cy.get('body').should('contain', expectedContent);
});

// Helper to check if content contains any of the expected values
Cypress.Commands.add('shouldContainOneOf', { prevSubject: true }, (subject, expectedValues) => {
  const text = subject.text();
  const found = expectedValues.some(value => text.includes(value));
  expect(found, `Expected to find one of [${expectedValues.join(', ')}] in "${text}"`).to.be.true;
  return cy.wrap(subject);
});