// cypress/support/commands.js

// -- Custom Commands for Apartment Management System --

// Command to bypass login and navigate directly to home
Cypress.Commands.add('bypassLogin', () => {
  cy.visit('/');
  cy.get('button').contains('Login').click();
  cy.url().should('include', '/home');
  // Wait for dashboard to load with timeout
  cy.get('h4, .MuiTypography-h4', { timeout: 15000 }).should('be.visible');
});

// Command to wait for API to be ready
Cypress.Commands.add('waitForApi', () => {
  const apiBaseUrl = Cypress.env('API_BASE_URL') || 'https://apt.krentiz.dev/api';
  cy.request({
    method: 'GET',
    url: `${apiBaseUrl}/api/rooms/ping`,
    failOnStatusCode: false,
    timeout: 10000
  }).then((response) => {
    if (response.status !== 200) {
      // Try alternative endpoint if ping doesn't exist
      cy.request({
        method: 'GET',
        url: `${apiBaseUrl}/api/rooms`,
        failOnStatusCode: false,
        timeout: 10000
      }).then((altResponse) => {
        if (altResponse.status !== 200) {
          throw new Error('Backend API is not responding. Please ensure the Spring Boot server is running on port 8080.');
        }
      });
    }
  });
});

// Command to clean up test data by type
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
    ids.forEach(id => {
      cy.request({
        method: 'DELETE',
        url: `${apiBaseUrl}${apiEndpoints[dataType]}/${id}`,
        failOnStatusCode: false
      });
    });
  }
});

// Command to navigate using drawer menu labels (Thai text from Home.js)
Cypress.Commands.add('navigateTo', (section) => {
  // Click the menu button to open the drawer
  cy.get('button[aria-label="open drawer"]').click();
  
  // Wait for the drawer to be visible with timeout
  cy.get('.MuiDrawer-paper', { timeout: 10000 }).should('be.visible');
  
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
  cy.get('.MuiDialog-root', { timeout: 10000 }).should('be.visible');
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

// Improved command to fill MUI TextField by label
Cypress.Commands.add('fillMuiField', (label, value) => {
  // Try multiple strategies to find the field
  cy.get('body').then(($body) => {
    // Strategy 1: Look for FormControl with label
    const formControl = $body.find('.MuiFormControl-root').filter((index, element) => {
      return Cypress.$(element).find('label').text().includes(label);
    });
    
    if (formControl.length > 0) {
      cy.wrap(formControl.first()).find('input, textarea').clear().type(value);
    } else {
      // Strategy 2: Look for input with placeholder
      const inputWithPlaceholder = $body.find(`input[placeholder*="${label}"]`);
      if (inputWithPlaceholder.length > 0) {
        cy.wrap(inputWithPlaceholder.first()).clear().type(value);
      } else {
        // Strategy 3: Look for label and find nearby input
        cy.contains('label', label).parent().find('input, textarea').first().clear().type(value);
      }
    }
  });
});

// Improved command to select from MUI dropdown
Cypress.Commands.add('selectMuiDropdown', (label, value) => {
  // Find the dropdown by label and click it
  cy.get('.MuiFormControl-root')
    .contains('label', label)
    .parent()
    .find('.MuiSelect-select, [role="button"]')
    .click();
  
  // Wait for dropdown options and click the desired value
  cy.get('.MuiMenuItem-root, [role="option"]', { timeout: 5000 })
    .contains(value)
    .click();
});

// API helper commands with better error handling
Cypress.Commands.add('createTestRoom', (roomData) => {
  const apiBaseUrl = Cypress.env('API_BASE_URL') || 'https://apt.krentiz.dev/api';
  const defaultData = {
    number: Math.floor(Math.random() * 9000) + 1000,
    status: 'FREE'
  };
  return cy.request({
    method: 'POST',
    url: `${apiBaseUrl}/api/rooms`,
    body: { ...defaultData, ...roomData },
    failOnStatusCode: false
  });
});

Cypress.Commands.add('createTestTenant', (tenantData) => {
  const apiBaseUrl = Cypress.env('API_BASE_URL') || 'https://apt.krentiz.dev/api';
  const defaultData = {
    name: 'Test Tenant ' + Date.now(),
    phone: '000-000-0000',
    lineId: 'test_line_' + Date.now()
  };
  return cy.request('POST', `${apiBaseUrl}/api/tenants`, { 
    ...defaultData, 
    ...tenantData 
  });
});

Cypress.Commands.add('createTestLease', (leaseData) => {
  const apiBaseUrl = Cypress.env('API_BASE_URL') || 'https://apt.krentiz.dev/api';
  const defaultData = {
    startDate: new Date().toISOString().split('T')[0],
    monthlyRent: 7000,
    depositBaht: 14000
  };
  return cy.request('POST', `${apiBaseUrl}/api/leases`, { 
    ...defaultData, 
    ...leaseData 
  });
});

Cypress.Commands.add('createTestInvoice', (invoiceData) => {
  const apiBaseUrl = Cypress.env('API_BASE_URL') || 'https://apt.krentiz.dev/api';
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
  return cy.request('POST', `${apiBaseUrl}/api/invoices`, { 
    ...defaultData, 
    ...invoiceData 
  });
});

Cypress.Commands.add('createTestMaintenance', (maintenanceData) => {
  const apiBaseUrl = Cypress.env('API_BASE_URL') || 'https://apt.krentiz.dev/api';
  const defaultData = {
    description: 'Test maintenance task ' + Date.now(),
    scheduledDate: new Date().toISOString().split('T')[0],
    costBaht: 500
  };
  return cy.request('POST', `${apiBaseUrl}/api/maintenance`, { 
    ...defaultData, 
    ...maintenanceData 
  });
});

// Command to wait for table/list to load
Cypress.Commands.add('waitForTable', () => {
  cy.get('.MuiTable-root, .room-table, .invoice-table, table', { timeout: 15000 }).should('be.visible');
});

// Command to find row in table by content
Cypress.Commands.add('findTableRow', (content) => {
  return cy.get('tr').contains(content).parent('tr');
});

// Command to click tab by text with better error handling
Cypress.Commands.add('clickTab', (tabText) => {
  // Try different selectors for tabs
  cy.get('body').then(($body) => {
    if ($body.find('.MuiTab-root').length > 0) {
      cy.get('.MuiTab-root').contains(tabText).click();
    } else if ($body.find('.tab-btn').length > 0) {
      cy.get('.tab-btn').contains(tabText).click();
    } else {
      cy.get('[role="tab"], .tab').contains(tabText).click();
    }
  });
});

// Command to wait for page load by checking for specific content
Cypress.Commands.add('waitForPageLoad', (expectedContent) => {
  cy.get('body', { timeout: 15000 }).should('contain', expectedContent);
});

// Helper to check if content contains any of the expected values with better error messages
Cypress.Commands.add('shouldContainOneOf', { prevSubject: true }, (subject, expectedValues) => {
  const text = subject.text();
  const found = expectedValues.some(value => text.includes(value));
  
  if (!found) {
    cy.log(`Text content: ${text}`);
    cy.log(`Expected one of: ${expectedValues.join(', ')}`);
  }
  
  expect(found, `Expected to find one of [${expectedValues.join(', ')}] in "${text.substring(0, 200)}..."`).to.be.true;
  return cy.wrap(subject);
});

// Command to handle flaky elements with retry logic
Cypress.Commands.add('clickWithRetry', (selector, options = {}) => {
  const maxRetries = options.maxRetries || 3;
  const delay = options.delay || 1000;
  
  function attemptClick(retryCount = 0) {
    cy.get('body').then(() => {
      cy.get(selector).then($el => {
        if ($el.length > 0) {
          cy.wrap($el.first()).click();
        } else if (retryCount < maxRetries) {
          cy.wait(delay);
          attemptClick(retryCount + 1);
        } else {
          throw new Error(`Element ${selector} not found after ${maxRetries} retries`);
        }
      });
    });
  }
  
  attemptClick();
});

// Command to wait for element to be stable (not moving/changing)
Cypress.Commands.add('waitForStable', (selector, options = {}) => {
  const timeout = options.timeout || 5000;
  const interval = options.interval || 100;
  
  cy.get(selector, { timeout }).should('be.visible').then($el => {
    const initialRect = $el[0].getBoundingClientRect();
    
    cy.wait(interval).then(() => {
      cy.get(selector).then($newEl => {
        const newRect = $newEl[0].getBoundingClientRect();
        
        if (Math.abs(initialRect.top - newRect.top) > 1 || 
            Math.abs(initialRect.left - newRect.left) > 1) {
          // Element moved, wait again
          cy.waitForStable(selector, options);
        }
      });
    });
  });
});