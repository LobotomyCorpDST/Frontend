// cypress/e2e/cypress_e2e_tests.js

describe('Apartment Management System - E2E Tests', () => {
  beforeEach(() => {
    // cy.waitForApi();
    cy.bypassLogin();
  });

  it('should navigate to Dashboard and show rooms', () => {
    cy.contains('Dashboard');
    cy.contains('Floor 1').click();
    cy.contains('101').should('exist');
  });

  it('should create a new Lease and change room status', () => {
    cy.navigateTo('ประวัติสัญญาเช่า');
    cy.contains('เพิ่มสัญญาเช่า').click();

    // **FIX:** Use the 'name' attribute for selectors
    cy.get('input[name="roomNumber"]').type('102');
    cy.get('input[name="tenantId"]').type('1');
    cy.get('input[name="startDate"]').type('2025-01-01');
    cy.contains('สร้างสัญญา').click();

    cy.contains('102');
  });

  it('should create a new Invoice from Invoices page', () => {
    cy.navigateTo('ใบแจ้งหนี้');
    cy.contains('เพิ่มใบแจ้งหนี้').click();

    // **FIX:** Use the 'name' attribute for selectors
    cy.get('input[name="roomNumber"]').type('101');
    cy.contains('Create').click();

    cy.contains('101').should('exist');
  });

  it('should show error on invalid lease data', () => {
    cy.navigateTo('Lease');
    cy.contains('+ เพิ่มสัญญาเช่า').click();
    cy.contains('สร้างสัญญา').click();

    cy.contains('กรอก เลขห้อง');
  });
});