// cypress/e2e/apartment-management.cy.js

describe('Apartment Management System - E2E Tests', () => {
  const API_BASE = (Cypress.env('API_BASE_URL') || 'https://apt.krentiz.dev').replace(/\/+$/, '');
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
    
    // Wait for dashboard to load
    cy.get('[data-cy=dashboard-title]').should('be.visible');
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
      // Open drawer menu
      cy.get('button[aria-label="open drawer"]').click();
      cy.get('.MuiDrawer-paper').should('be.visible');
      
      // Navigate to rooms section
      cy.contains('ห้องทั้งหมด').click();
      
      // Trigger add room signal by clicking the add button
      cy.get('button').contains('เพิ่มห้อง').click();
      
      // Wait for and fill the modal
      cy.get('.MuiDialog-root').should('be.visible');
      
      const testRoomNumber = 888;
      cy.fillMuiField('เลขห้อง *', testRoomNumber.toString());
      cy.selectMuiDropdown('สถานะ', 'FREE');
      
      cy.get('button').contains('สร้างห้อง').click();
      
      // Verify room appears in list
      cy.contains(testRoomNumber.toString()).should('be.visible');
      
      // Store for cleanup
      cy.request('GET', `${API_BASE}/api/rooms/by-number/${testRoomNumber}`)
        .then((response) => {
          createdTestData.rooms.push(response.body.id);
        });
    });

    it('should show error for duplicate room number', () => {
      cy.get('button[aria-label="open drawer"]').click();
      cy.contains('ห้องทั้งหมด').click();
      cy.get('button').contains('เพิ่มห้อง').click();
      
      // Try existing room number (101)
      cy.fillMuiField('เลขห้อง *', '101');
      cy.selectMuiDropdown('สถานะ', 'FREE');
      cy.get('button').contains('สร้างห้อง').click();
      
      // Should show error
      cy.get('.MuiAlert-root').should('be.visible').shouldContainOneOf(['already exists', 'ซ้ำ', 'มีอยู่แล้ว']);
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
      
      // Click on invoice tab
      cy.get('.MuiTab-root').contains('ใบแจ้งหนี้').click();
      
      // Click create invoice button
      cy.get('button').contains('สร้างใบแจ้งหนี้').click();
      
      // Fill invoice form in dialog
      cy.get('.MuiDialog-root').should('be.visible');
      // Use more specific selectors for the form fields
      cy.get('input[placeholder="เช่น 101"]').should('not.exist'); // This field shouldn't exist in room-specific modal
      cy.get('input[step="0.01"]').first().type('100'); // electricity units
      cy.get('input[step="0.01"]').eq(1).type('8'); // electricity rate
      cy.get('input[step="0.01"]').eq(2).type('5'); // water units  
      cy.get('input[step="0.01"]').eq(3).type('18'); // water rate
      cy.get('input[step="0.01"]').last().type('50'); // other
      
      cy.get('button').contains('Create').click();
      
      // Verify invoice appears in list
      cy.get('.MuiTable-root').should('contain.oneOf', ['PENDING', 'Pending', 'รอชำระ']);
    });

    it('should create invoice from invoice history page with tenantId', () => {
      cy.get('button[aria-label="open drawer"]').click();
      cy.contains('ใบแจ้งหนี้').click();
      
      // Click add invoice button
      cy.get('button').contains('เพิ่มใบแจ้งหนี้').click();
      
      // Fill form
      cy.get('.MuiDialog-root').should('be.visible');
      cy.get('input[placeholder="เช่น 101"]').type('101');
      // Fill required tenant ID to avoid API error
      cy.fillMuiField('Tenant ID', '2'); // Jane Smith from SQL dump
      cy.get('input[step="0.01"]').first().type('100');
      cy.get('input[step="0.01"]').eq(1).type('8');
      
      cy.get('button').contains('Create').click();
      
      // Should see invoice in list
      cy.contains('101').should('be.visible');
    });

    it('should mark invoice as paid', () => {
      // Create test invoice first with proper payload
      cy.request({
        method: 'POST',
        url: `${API_BASE}/api/invoices`,
        body: {
          roomId: 1, // Room 101
          tenantId: 2, // Jane Smith from SQL dump
          billingYear: 2025,
          billingMonth: 1,
          issueDate: '2025-01-01',
          dueDate: '2025-01-08',
          rentBaht: 7000
        }
      }).then((response) => {
        const invoiceId = response.body.id;
        createdTestData.invoices.push(invoiceId);

        cy.get('button[aria-label="open drawer"]').click();
        cy.contains('ใบแจ้งหนี้').click();
        
        // Find invoice and mark as paid
        cy.get('.MuiTable-root').contains(invoiceId.toString()).parent('tr').within(() => {
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
      cy.get('.MuiTab-root').contains('บำรุงรักษา').click();
      
      // Click create maintenance button
      cy.get('button').contains('เพิ่มงานบำรุงรักษา').click();
      
      // Fill form
      cy.get('.MuiDialog-root').should('be.visible');
      cy.get('input[type="date"]').clear().type('2025-01-15');
      cy.get('textarea, input[multiline]').type('Test maintenance task');
      cy.fillMuiField('ค่าใช้จ่าย (บาท)', '500');
      
      cy.get('button').contains('บันทึก').click();
      
      // Verify task appears
      cy.contains('Test maintenance task').should('be.visible');
    });

    it('should mark maintenance as completed', () => {
      // Create test maintenance
      cy.request('POST', `${API_BASE}/api/maintenance`, {
        roomId: 1,
        description: 'Test completion',
        scheduledDate: '2025-01-15',
        costBaht: 300
      }).then((response) => {
        createdTestData.maintenance.push(response.body.id);

        cy.visit('/room-details/101');
        cy.get('.MuiTab-root').contains('บำรุงรักษา').click();
        
        // Mark as completed
        cy.contains('Test completion').parent('tr').within(() => {
          cy.get('button').contains('ทำเสร็จ').click();
        });
        
        // Verify completed status - look for chip containing completion status
        cy.get('.MuiChip-root').should('contain.oneOf', ['COMPLETED', 'เสร็จสิ้น', 'สำเร็จ']);
      });
    });
  });

  describe('Navigation and Integration', () => {
    it('should navigate between all main sections', () => {
      // Test navigation through drawer menu
      const sections = [
        'ห้องทั้งหมด',
        'ใบแจ้งหนี้', 
        'บำรุงรักษา',
        'ประวัติสัญญาเช่า'
      ];

      sections.forEach(section => {
        cy.get('button[aria-label="open drawer"]').click();
        cy.contains(section).click();
        cy.get('.MuiDrawer-paper').should('not.be.visible'); // Drawer should close
        // Verify we're in the right section (each has unique content)
        cy.get('body').shouldContainOneOf(['Room No.', 'Invoice ID', 'Maintenance', 'Lease', 'รายการ', 'หมายเลข']);
      });
    });

    it('should complete end-to-end workflow: room → lease → invoice', () => {
      // Create room via API
      cy.request({
        method: 'POST',
        url: `${API_BASE}/api/rooms`,
        body: {
          number: 999,
          status: 'FREE'
        },
        failOnStatusCode: false
      }).then((roomResponse) => {
        if (roomResponse.status === 201 || roomResponse.status === 200) {
          createdTestData.rooms.push(roomResponse.body.id);

          // Create lease via UI
          cy.get('button[aria-label="open drawer"]').click();
          cy.contains('ประวัติสัญญาเช่า').click();
          cy.get('button').contains('+ เพิ่มสัญญาเช่า').click();
          
          cy.fillMuiField('เลขห้อง *', '999');
          cy.fillMuiField('Tenant ID *', '1');
          cy.get('input[type="date"]').first().clear().type('2025-01-01');
          cy.fillMuiField('ค่าเช่าต่อเดือน (บาท)', '7000');
          
          cy.get('button').contains('สร้างสัญญา').click();
          
          // Verify lease created
          cy.contains('999').should('be.visible');
          
          // Navigate to room details and create invoice
          cy.visit('/room-details/999');
          cy.get('.MuiTab-root').contains('ใบแจ้งหนี้').click();
          cy.get('button').contains('สร้างใบแจ้งหนี้').click();
          
          cy.get('input[step="0.01"]').first().type('100');
          cy.get('input[step="0.01"]').eq(1).type('8');
          cy.get('button').contains('Create').click();
          
          // Verify invoice created
          cy.get('.MuiTable-root').should('contain.oneOf', ['PENDING', 'Pending', 'รอชำระ']);

          // Store lease for cleanup
          cy.request({
            method: 'GET',
            url: `${API_BASE}/api/leases/active?roomNumber=999`,
            failOnStatusCode: false
          }).then((leaseResponse) => {
            if (leaseResponse.body && leaseResponse.body.id) {
              createdTestData.leases.push(leaseResponse.body.id);
            }
          });
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent room gracefully', () => {
      cy.visit('/room-details/99999', { failOnStatusCode: false });
      cy.get('body').shouldContainOneOf(['Error', 'not found', 'ไม่พบ', '404']);
    });

    it('should validate required fields in forms', () => {
      // Test lease form validation
      cy.get('button[aria-label="open drawer"]').click();
      cy.contains('ประวัติสัญญาเช่า').click();
      cy.get('button').contains('+ เพิ่มสัญญาเช่า').click();
      
      // Submit empty form
      cy.get('button').contains('สร้างสัญญา').click();
      
      // Should show validation message
      cy.get('body').shouldContainOneOf(['required', 'กรอก', 'ต้องมี']);
    });
  });
});
