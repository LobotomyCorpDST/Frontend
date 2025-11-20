// cypress/e2e/copytest.cy.js

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
    cy.visit('/');
    cy.get('[data-cy=login-username-input]').type('admin');
    cy.get('[data-cy=login-password-input]').type('1234');
    cy.get('[data-cy=login-submit-button]').click();
    cy.url().should('include', '/home');
    cy.get('[data-cy=dashboard-title]').should('be.visible');
  });

  afterEach(() => {
    cy.cleanupData('invoices', createdTestData.invoices);
    cy.cleanupData('maintenance', createdTestData.maintenance);
    cy.cleanupData('leases', createdTestData.leases);
    cy.cleanupData('rooms', createdTestData.rooms);
    Object.keys(createdTestData).forEach(key => {
      createdTestData[key] = [];
    });
  });

  describe('Dashboard Navigation', () => {
    it('should display dashboard with room statistics and allow floor filtering', () => {
      cy.contains('สรุปภาพรวม').should('be.visible');
      cy.contains('ทั้งหมด').should('be.visible');
      cy.get('[data-cy^="dashboard-floor-title-"]').should('exist');
      cy.contains('ชั้น').should('be.visible');
      cy.get('.MuiCard-root').should('exist');
    });

    it('should navigate to room details when clicking on room card', () => {
      cy.get('.MuiCard-root', { timeout: 10000 }).first().click();
      cy.url().should('include', '/room-details/');
    });
  });

  describe('Room Management', () => {
    it('should create a new room successfully', () => {
      cy.navigateTo('rooms');
      cy.get('button').contains('เพิ่มห้อง').click();
      cy.get('.MuiDialog-root').should('be.visible');

      const testRoomNumber = Math.floor(Math.random() * 8000) + 1000;
      cy.fillMuiField('เลขห้อง', testRoomNumber.toString());
      cy.selectMuiDropdown('สถานะ', 'FREE');
      cy.get('button').contains('สร้างห้อง').click();
      cy.get('.MuiDialog-root').should('not.exist');
      cy.get('.MuiBackdrop-root').should('not.exist');
      cy.contains(testRoomNumber.toString()).should('be.visible');

      cy.window().then(win => {
        const token = win.localStorage.getItem('token');
        cy.request({
          method: 'GET',
          url: `${API_BASE}/api/rooms`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false
        }).then(res => {
          const room = res.body.find(r => r.number == testRoomNumber);
          if (room) createdTestData.rooms.push(room.id);
        });
      });
    });
  });

  describe('Invoice Management', () => {
    it('should mark invoice as paid', () => {
      const testRoomNum = Math.floor(Math.random() * 8000) + 1000;

      cy.createTestRoom({ number: testRoomNum, status: 'OCCUPIED' }).then(roomRes => {
        expect(roomRes.status).to.eq(201);
        const roomId = roomRes.body.id;
        createdTestData.rooms.push(roomId);

        cy.createTestInvoice({
          roomId,
          tenantId: 2,
          rentBaht: 7000
        }).then(response => {
          expect(response.status).to.eq(201, 'Invoice should be created successfully');
          const invoiceId = response.body.id;
          createdTestData.invoices.push(invoiceId);

          cy.navigateTo('invoices');
          cy.contains(invoiceId.toString()).should('be.visible');
          cy.contains(invoiceId.toString()).parent('tr').within(() => {
            cy.get('button').contains('Mark Paid').click();
          });

          cy.get('.MuiChip-root').should('contain.oneOf', ['Paid', 'ชำระแล้ว']);
        });
      });
    });
  });

  describe('Maintenance Management', () => {
    it('should create maintenance task from room details', () => {
      const testRoomNum = 5555;
      cy.createTestRoom({ number: testRoomNum, status: 'OCCUPIED' }).then(res => {
        createdTestData.rooms.push(res.body.id);

        cy.visit(`/room-details/${testRoomNum}`);
        cy.contains('บำรุงรักษา').click();
        cy.get('button').contains('เพิ่มงานบำรุงรักษา').click();
        cy.get('.MuiDialog-root').should('be.visible');
        cy.get('input[type="date"]').clear().type('2025-01-15');
        cy.get('.MuiDialogContent-root textarea').first().type('Test maintenance task');
        cy.fillMuiField('ค่าใช้จ่าย (บาท)', '500');
        cy.get('button').contains('บันทึก').click();
        cy.get('.MuiDialog-root').should('not.exist');
        cy.get('.MuiBackdrop-root').should('not.exist');
        cy.contains('Test maintenance task').should('be.visible');
      });
    });

    it('should mark maintenance as completed', () => {
      const testRoomNum = 6666;
      cy.createTestRoom({ number: testRoomNum, status: 'OCCUPIED' }).then(roomRes => {
        const roomId = roomRes.body.id;
        createdTestData.rooms.push(roomId);

        cy.createTestMaintenance({
          roomId,
          description: 'Test completion',
          scheduledDate: '2025-01-15',
          costBaht: 300
        }).then(response => {
          expect(response.status).to.eq(201);
          createdTestData.maintenance.push(response.body.id);

          cy.visit(`/room-details/${testRoomNum}`);
          cy.contains('บำรุงรักษา').click();
          cy.contains('Test completion').parent('tr').within(() => {
            cy.get('button').contains('ทำเสร็จ').click();
          });
          cy.get('.MuiChip-root').should('contain.oneOf', ['COMPLETED', 'เสร็จสิ้น', 'สำเร็จ']);
        });
      });
    });
  });

  describe('Navigation and Integration', () => {
    it('should navigate between all main sections', () => {
      const sections = ['ห้องทั้งหมด', 'ใบแจ้งหนี้', 'บำรุงรักษา'];

      sections.forEach(section => {
        cy.get('button[aria-label="open drawer"]').click();
        cy.contains(section).click();
        cy.get('.MuiDrawer-paper').should('not.be.visible');
        cy.wait(500);
        cy.get('body').should('exist');
      });
    });
  });
});
