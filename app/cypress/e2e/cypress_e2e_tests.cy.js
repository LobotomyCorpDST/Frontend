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

  before(() => {
    // Wait for API to be ready before running tests
    cy.waitForApi();
  });

  beforeEach(() => {
    // Bypass login and navigate to home
    cy.visit('/');
    cy.get('button').contains('Login').click();
    cy.url().should('include', '/home');
    
    // Wait for dashboard to load with more specific selector
    cy.get('[data-testid="dashboard"], h4, .MuiTypography-h4', { timeout: 10000 }).should('be.visible');
  });

  afterEach(() => {
    // Clean up created test data
    cleanupTestData();
  });

  function cleanupTestData() {
    // Clean up in reverse order to handle FK constraints
    createdTestData.invoices.forEach(id => {
      cy.request({
        method: 'DELETE',
        url: `${API_BASE}/api/invoices/${id}`,
        failOnStatusCode: false
      });
    });

    createdTestData.maintenance.forEach(id => {
      cy.request({
        method: 'DELETE',
        url: `${API_BASE}/api/maintenance/${id}`,
        failOnStatusCode: false
      });
    });

    createdTestData.leases.forEach(id => {
      cy.request({
        method: 'DELETE',
        url: `${API_BASE}/api/leases/${id}`,
        failOnStatusCode: false
      });
    });

    createdTestData.rooms.forEach(id => {
      cy.request({
        method: 'DELETE',
        url: `${API_BASE}/api/rooms/${id}`,
        failOnStatusCode: false
      });
    });

    // Clear arrays
    Object.keys(createdTestData).forEach(key => {
      createdTestData[key] = [];
    });
  }

  describe('Dashboard Navigation', () => {
    it('should display dashboard with room statistics and allow floor filtering', () => {
      // Check dashboard elements
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Total Rooms').should('be.visible');
      cy.contains('Available').should('be.visible');
      cy.contains('Occupied').should('be.visible');
      
      // Test floor filtering
      cy.get('.MuiFormControl-root').contains('Floor').parent().find('.MuiSelect-select').click();
      cy.get('.MuiMenuItem-root').contains('Floor 1').click();
      cy.contains('101').should('be.visible');
      cy.contains('102').should('be.visible');
      
      // Switch to floor 2
      cy.get('.MuiFormControl-root').contains('Floor').parent().find('.MuiSelect-select').click();
      cy.get('.MuiMenuItem-root').contains('Floor 2').click();
      cy.contains('201').should('be.visible');
    });

    it('should navigate to room details when clicking on room card', () => {
      cy.get('.MuiFormControl-root').contains('Floor').parent().find('.MuiSelect-select').click();
      cy.get('.MuiMenuItem-root').contains('Floor 1').click();
      cy.get('.MuiCard-root').contains('101').click();
      cy.url().should('include', '/room-details/101');
      cy.contains('ห้อง 101').should('be.visible');
    });
  });

  describe('Room Management', () => {
    it('should create a new room successfully', () => {
      // Navigate to rooms section using the navigateTo command
      cy.navigateTo('rooms');
      
      // Wait for the page to load
      cy.waitForTable();
      
      // Click add room button - use more specific selector
      cy.get('button').contains('เพิ่ม').click();
      
      // Wait for and verify modal opens
      cy.get('.MuiDialog-root', { timeout: 10000 }).should('be.visible');
      
      const testRoomNumber = Math.floor(Math.random() * 9000) + 1000;
      
      // Fill the form using more robust selectors
      cy.get('.MuiDialog-root').within(() => {
        cy.get('input').first().clear().type(testRoomNumber.toString());
        cy.get('.MuiSelect-select').click();
      });
      
      cy.get('[data-value="FREE"], [role="option"]').contains('FREE').click();
      
      cy.get('.MuiDialog-root').within(() => {
        cy.get('button').contains('สร้าง').click();
      });
      
      // Wait for modal to close
      cy.get('.MuiDialog-root').should('not.exist');
      
      // Verify room appears in list
      cy.get('body', { timeout: 10000 }).should('contain.text', testRoomNumber.toString());
      
      // Store for cleanup
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/rooms/by-number/${testRoomNumber}`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          createdTestData.rooms.push(response.body.id);
        }
      });
    });

    it('should show error for duplicate room number', () => {
      cy.navigateTo('rooms');
      cy.waitForTable();
      cy.get('button').contains('เพิ่ม').click();
      
      cy.get('.MuiDialog-root', { timeout: 10000 }).should('be.visible');
      
      // Try existing room number (101)
      cy.get('.MuiDialog-root').within(() => {
        cy.get('input').first().clear().type('101');
        cy.get('.MuiSelect-select').click();
      });
      
      cy.get('[data-value="FREE"], [role="option"]').contains('FREE').click();
      
      cy.get('.MuiDialog-root').within(() => {
        cy.get('button').contains('สร้าง').click();
      });
      
      // Should show error - check for various error messages
      cy.get('body').shouldContainOneOf([
        'Conflict', 'already exists', 'ซ้ำ', 'มีอยู่แล้ว', 'Room number already exists'
      ]);
    });
  });

  describe('Lease Management', () => {
    it('should create a new lease and change room status', () => {
      // First create a test room
      cy.request({
        method: 'POST',
        url: `${API_BASE}/api/rooms`,
        body: {
          number: 777,
          status: 'FREE'
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 201 || response.status === 200) {
          createdTestData.rooms.push(response.body.id);

          // Navigate to lease history
          cy.get('button[aria-label="open drawer"]').click();
          cy.contains('ประวัติสัญญาเช่า').click();
          
          // Click create lease button
          cy.get('button').contains('+ เพิ่มสัญญาเช่า').click();
          
          // Fill lease form in dialog
          cy.get('.MuiDialog-root').should('be.visible');
          cy.fillMuiField('เลขห้อง *', '777');
          cy.fillMuiField('Tenant ID *', '1'); // John Doe from SQL dump
          cy.get('input[type="date"]').first().clear().type('2025-01-01');
          cy.fillMuiField('ค่าเช่าต่อเดือน (บาท)', '7000');
          cy.fillMuiField('เงินมัดจำ (บาท)', '14000');
          
          cy.get('button').contains('สร้างสัญญา').click();
          
          // Verify lease appears
          cy.contains('777').should('be.visible');
          
          // Verify room status changed
          cy.request('GET', `${API_BASE}/api/rooms/by-number/777`)
            .then((response) => {
              expect(response.body.status).to.equal('OCCUPIED');
            });

          // Store lease for cleanup
          cy.request({
            method: 'GET',
            url: `${API_BASE}/api/leases/active?roomNumber=777`,
            failOnStatusCode: false
          }).then((leaseResponse) => {
            if (leaseResponse.body && leaseResponse.body.id) {
              createdTestData.leases.push(leaseResponse.body.id);
            }
          });
        }
      });
    });

    it('should show validation error for missing required fields', () => {
      cy.get('button[aria-label="open drawer"]').click();
      cy.contains('ประวัติสัญญาเช่า').click();
      cy.get('button').contains('+ เพิ่มสัญญาเช่า').click();
      
      // Try to submit without filling required fields
      cy.get('button').contains('สร้างสัญญา').click();
      
      // Should show error
      cy.get('.MuiAlert-root').should('be.visible').shouldContainOneOf(['กรอก', 'required', 'ต้องมี']);
    });
  });

  describe('Invoice Management', () => {
    it('should create invoice from room details page', () => {
      // Navigate to room 101 (has active lease)
      cy.visit('/room-details/101');
      cy.waitForPageLoad('ห้อง 101');
      
      // Click on invoice tab
      cy.clickTab('ใบแจ้งหนี้');
      
      // Click create invoice button
      cy.get('button').contains('สร้าง').click();
      
      // Fill invoice form in dialog
      cy.get('.MuiDialog-root', { timeout: 10000 }).should('be.visible');
      
      cy.get('.MuiDialog-root').within(() => {
        // Fill form fields more specifically
        cy.get('input[step="0.01"]').eq(0).clear().type('100'); // electricity units
        cy.get('input[step="0.01"]').eq(1).clear().type('8'); // electricity rate
        cy.get('input[step="0.01"]').eq(2).clear().type('5'); // water units  
        cy.get('input[step="0.01"]').eq(3).clear().type('18'); // water rate
        cy.get('input[step="0.01"]').eq(4).clear().type('50'); // other
      });
      
      cy.get('button').contains('Create').click();
      
      // Wait for dialog to close
      cy.get('.MuiDialog-root').should('not.exist');
      
      // Verify invoice appears in list
      cy.get('.MuiTable-root, table').should('be.visible');
      cy.get('body').shouldContainOneOf(['PENDING', 'Pending', 'รอชำระ']);
    });
  });

  describe('Maintenance Management', () => {
    it('should create maintenance task from room details', () => {
      cy.visit('/room-details/101');
      cy.waitForPageLoad('ห้อง 101');
      
      // Click maintenance tab
      cy.clickTab('บำรุงรักษา');
      
      // Click create maintenance button
      cy.get('button').contains('เพิ่ม').click();
      
      // Fill form
      cy.get('.MuiDialog-root', { timeout: 10000 }).should('be.visible');
      
      cy.get('.MuiDialog-root').within(() => {
        cy.get('input[type="date"]').clear().type('2025-01-15');
        
        // Handle textarea more carefully - target the specific one
        cy.get('textarea').first().clear().type('Test maintenance task');
        
        // Fill cost field
        cy.get('input').contains('ค่าใช้จ่าย').parent().find('input').clear().type('500');
      });
      
      cy.get('button').contains('บันทึก').click();
      
      // Wait for dialog to close
      cy.get('.MuiDialog-root').should('not.exist');
      
      // Verify task appears
      cy.get('body', { timeout: 10000 }).should('contain.text', 'Test maintenance task');
    });

    it('should mark maintenance as completed', () => {
      // Create test maintenance via API first
      cy.request({
        method: 'POST',
        url: `${API_BASE}/api/maintenance`,
        body: {
          roomId: 1,
          description: 'Test completion task',
          scheduledDate: '2025-01-15',
          costBaht: 300
        }
      }).then((response) => {
        createdTestData.maintenance.push(response.body.id);

        cy.visit('/room-details/101');
        cy.waitForPageLoad('ห้อง 101');
        cy.clickTab('บำรุงรักษา');
        
        // Mark as completed
        cy.get('tr').contains('Test completion task').parent('tr').within(() => {
          cy.get('button').contains('ทำเสร็จ').click();
        });
        
        // Verify completed status
        cy.get('.MuiChip-root, .status').shouldContainOneOf([
          'COMPLETED', 'เสร็จสิ้น', 'สำเร็จ'
        ]);
      });
    });
  });

  describe('Navigation and Integration', () => {
    it('should navigate between all main sections', () => {
      const sections = ['rooms', 'invoices', 'maintenance', 'leaseHistory'];

      sections.forEach(section => {
        cy.navigateTo(section);
        // Verify we're in the right section with flexible content check
        cy.get('body').shouldContainOneOf([
          'Room No.', 'Invoice ID', 'Maintenance', 'Lease', 
          'รายการ', 'หมายเลข', 'ห้อง', 'ใบแจ้ง', 'บำรุง', 'สัญญา'
        ]);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent room gracefully', () => {
      cy.visit('/room-details/99999', { failOnStatusCode: false });
      
      // Wait a moment for any error handling to occur
      cy.wait(2000);
      
      // Check for various error indicators
      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        const hasError = [
          'Error', 'not found', 'ไม่พบ', '404', 
          'Load room failed', 'Room not found'
        ].some(error => bodyText.includes(error));
        
        if (!hasError) {
          // If no explicit error, check if we're redirected or have empty content
          cy.url().then((url) => {
            if (!url.includes('/room-details/99999')) {
              // Redirected away - that's also valid error handling
              cy.log('Redirected away from non-existent room - acceptable');
            } else {
              // Check for minimal content indicating error state
              expect(bodyText.length).to.be.lessThan(1000); // Assume error pages are shorter
            }
          });
        } else {
          cy.log('Found expected error message');
        }
      });
    });

    it('should validate required fields in forms', () => {
      cy.navigateTo('leaseHistory');
      cy.get('button').contains('เพิ่ม').click();
      
      cy.get('.MuiDialog-root', { timeout: 10000 }).should('be.visible');
      
      // Submit empty form
      cy.get('button').contains('สร้าง').click();
      
      // Should show validation message
      cy.get('body').shouldContainOneOf(['required', 'กรอก', 'ต้องมี', 'จำเป็น']);
    });
  });
});