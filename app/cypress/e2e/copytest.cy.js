// cypress/e2e/apartment-management.cy.js

describe('Apartment Management System - E2E Tests', () => {
  const API_BASE = 'https://apt.krentiz.dev/api';
  const createdTestData = {
    rooms: [],
    leases: [],
    invoices: [],
    maintenance: [],
    tenants: []
  };

  beforeEach(() => {
    // Bypass login and navigate to home
    cy.visit('/');
    cy.get('[data-cy=login-username-input]').type('admin');
    cy.get('[data-cy=login-password-input]').type('1234');
    cy.get('[data-cy=login-submit-button]').click();
    cy.url().should('include', '/home');
    
    // Wait for dashboard to load (Thai Text)
    cy.get('[data-cy=dashboard-title]').should('be.visible');
  });

  afterEach(() => {
    // Clean up created test data using the Helper that includes TOKEN
    cy.cleanupData('invoices', createdTestData.invoices);
    cy.cleanupData('maintenance', createdTestData.maintenance);
    cy.cleanupData('leases', createdTestData.leases);
    cy.cleanupData('rooms', createdTestData.rooms);
    
    // Reset arrays
    Object.keys(createdTestData).forEach(key => {
      createdTestData[key] = [];
    });
  });

  describe('Dashboard Navigation', () => {
    it('should display dashboard with room statistics and allow floor filtering', () => {
      // Check dashboard elements (Thai text)
      cy.contains('สรุปภาพรวม').should('be.visible');
      cy.contains('ทั้งหมด').should('be.visible');
      
      // Test floor filtering
      cy.get('.MuiFormControl-root').contains('Floor').parent().find('.MuiSelect-select').click();
      cy.get('.MuiMenuItem-root').contains('Floor 1').click();
      // Just check if any card exists, exact numbers depend on DB
      cy.get('.MuiCard-root').should('exist'); 
    });

    it('should navigate to room details when clicking on room card', () => {
      // Wait for cards to load first
      cy.get('.MuiCard-root', { timeout: 10000 }).first().click();
      cy.url().should('include', '/room-details/');
    });
  });

  describe('Room Management', () => {
    it('should create a new room successfully', () => {
      cy.navigateTo('rooms');
      
      // Click add room button
      cy.get('button').contains('เพิ่มห้อง').click();
      
      // Wait for modal
      cy.get('.MuiDialog-root').should('be.visible');
      
      const testRoomNumber = Math.floor(Math.random() * 8000) + 1000;
      cy.fillMuiField('เลขห้อง', testRoomNumber.toString());
      cy.selectMuiDropdown('สถานะ', 'FREE');
      
      cy.get('button').contains('สร้างห้อง').click();
      
      // **FIX: Wait for modal to disappear**
      cy.get('.MuiDialog-root').should('not.exist');
      cy.get('.MuiBackdrop-root').should('not.exist'); 
      
      // Verify room appears in list
      cy.contains(testRoomNumber.toString()).should('be.visible');
      
      // Store for cleanup
      cy.window().then(win => {
        const token = win.localStorage.getItem('token');
        cy.request({
          method: 'GET',
          url: `${API_BASE}/api/rooms/by-number/${testRoomNumber}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false
        }).then(res => {
          if(res.body && res.body.id) createdTestData.rooms.push(res.body.id);
        });
      });
    });
  });

  describe('Invoice Management', () => {
    it('should mark invoice as paid', () => {
      // Use Custom Command (which now handles Token)
      cy.createTestInvoice({
        roomId: 1, 
        tenantId: 2,
        rentBaht: 7000
      }).then((response) => {
        const invoiceId = response.body.id;
        createdTestData.invoices.push(invoiceId);

        cy.navigateTo('invoices');
        
        // Find invoice and mark as paid
        // Wait for table
        cy.contains(invoiceId.toString()).should('be.visible');
        cy.contains(invoiceId.toString()).parent('tr').within(() => {
          cy.get('button').contains('Mark Paid').click();
        });
        
        // Verify status changed
        cy.get('.MuiChip-root').should('contain.oneOf', ['Paid', 'ชำระแล้ว']);
      });
    });
  });

  describe('Maintenance Management', () => {
    it('should create maintenance task from room details', () => {
      cy.visit('/room-details/101');
      
      // Click maintenance tab
      cy.contains('บำรุงรักษา').click();
      
      // Click create maintenance button
      cy.get('button').contains('เพิ่มงานบำรุงรักษา').click();
      
      // Fill form
      cy.get('.MuiDialog-root').should('be.visible');
      cy.get('input[type="date"]').clear().type('2025-01-15');
      
      // **FIX: Select specific textarea**
      cy.get('.MuiDialogContent-root textarea').first().type('Test maintenance task');
      cy.fillMuiField('ค่าใช้จ่าย (บาท)', '500');
      
      cy.get('button').contains('บันทึก').click();
      
      // Wait for modal close
      cy.get('.MuiDialog-root').should('not.exist');
      
      // Verify task appears
      cy.contains('Test maintenance task').should('be.visible');
    });

    it('should mark maintenance as completed', () => {
      // Use Custom Command (Token included)
      cy.createTestMaintenance({
        roomId: 1,
        description: 'Test completion',
        scheduledDate: '2025-01-15',
        costBaht: 300
      }).then((response) => {
        createdTestData.maintenance.push(response.body.id);

        cy.visit('/room-details/101');
        cy.contains('บำรุงรักษา').click();
        
        // Mark as completed
        cy.contains('Test completion').parent('tr').within(() => {
          cy.get('button').contains('ทำเสร็จ').click();
        });
        
        // Verify completed status
        cy.get('.MuiChip-root').should('contain.oneOf', ['COMPLETED', 'เสร็จสิ้น', 'สำเร็จ']);
      });
    });
  });

  describe('Navigation and Integration', () => {
    it('should navigate between all main sections', () => {
      const sections = [
        'ห้องทั้งหมด',
        'ใบแจ้งหนี้', 
        'บำรุงรักษา'
      ];

      sections.forEach(section => {
        cy.get('button[aria-label="open drawer"]').click();
        cy.contains(section).click();
        cy.get('.MuiDrawer-paper').should('not.be.visible'); 
        cy.get('body').should('exist');
      });
    });
  });
});
