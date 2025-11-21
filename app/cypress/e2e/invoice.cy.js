describe('Invoice list page test', () => {

    beforeEach(() => {
        cy.intercept('GET', '/api/rooms**').as('getHistory');
        cy.visit('/');
        cy.get('[data-cy="login-username-input"]').type('Admin');
        cy.get('[data-cy="login-password-input"]').type('1234');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-3"]').click();

        cy.wait('@getHistory');
    });
    it('link to room detail (click room no.)', ()=>{
        cy.get('[data-cy="invoice-history-table-body"]').find('[data-cy^="invoice-history-row-room-link-"]').first().click();
        cy.get('[data-cy="room-detail-title-room-number"]').should('be.visible');
    })
    it('smart search by room number', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('201{enter}');
        cy.get('[data-cy="invoice-history-table-body"]').find('[data-cy^="invoice-history-row-room-"]').first().should('contain', '201');
    })

    it('smart search by invoice id', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('184{enter}');
        cy.get('[data-cy="invoice-history-table-body"]').find('[data-cy^="invoice-history-row-id-"]').first().should('contain', '184');
    })

    it('smart search by total due', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('4004{enter}');
        cy.get('[data-cy="invoice-history-table-body"]').find('[data-cy^="invoice-history-row-total-"]').first().should('contain', '4,004');
    })

    it('should sort by room number (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-roomNumber"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-roomNumber"]').click();

        cy.get('[data-cy^="invoice-history-row-room-link-"]').then(($items) => {
            const rooms = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedRooms = [...rooms].sort((a, b) => b - a);

            expect(rooms).to.deep.equal(sortedRooms);
        });
    });
    it('should sort by room number (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-roomNumber"]').click();

        cy.get('[data-cy^="invoice-history-row-room-link-"]').then(($items) => {
            const rooms = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedRooms = [...rooms].sort((a, b) => a - b);

            expect(rooms).to.deep.equal(sortedRooms);
        });
    });

    it('should sort by ID (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-id"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-id"]').click();

        cy.get('[data-cy^="invoice-history-row-id-"]').then(($items) => {
            const ids = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedIds = [...ids].sort((a, b) => b - a);

            expect(ids).to.deep.equal(sortedIds);
        });
    });
    it('should sort by ID (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-id"]').click();

        cy.get('[data-cy^="invoice-history-row-id-"]').then(($items) => {
            const ids = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedIds = [...ids].sort((a, b) => a - b);

            expect(ids).to.deep.equal(sortedIds);
        });
    });

    it('should sort by issue date (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-issueDate"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-issueDate"]').click();

        cy.get('[data-cy^="invoice-history-row-issue-date-"]').then(($items) => {
            const issues = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedIssues = [...issues].sort((a, b) => b - a);

            expect(issues).to.deep.equal(sortedIssues);
        });
    });
    it('should sort by issue date (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-issueDate"]').click();

        cy.get('[data-cy^="invoice-history-row-issue-date-"]').then(($items) => {
            const issues = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedIssues = [...issues].sort((a, b) => a - b);

            expect(issues).to.deep.equal(sortedIssues);
        });
    });

    it('should sort by due date (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-dueDate"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-dueDate"]').click();

        cy.get('[data-cy^="invoice-history-row-due-date-"]').then(($items) => {
            const dues = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedDues = [...dues].sort((a, b) => b - a);

            expect(dues).to.deep.equal(sortedDues);
        });
    });
    it('should sort by due date (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-dueDate"]').click();

        cy.get('[data-cy^="invoice-history-row-due-date-"]').then(($items) => {
            const dues = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedDues = [...dues].sort((a, b) => a - b);

            expect(dues).to.deep.equal(sortedDues);
        });
    });

    it('should sort by total baht (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-totalBaht"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-totalBaht"]').click();

        cy.get('[data-cy^="invoice-history-row-total-"]').then(($items) => {
            const totals = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedTotals = [...totals].sort((a, b) => b - a);

            expect(totals).to.deep.equal(sortedTotals);
        });
    });
    it('should sort by total baht (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-totalBaht"]').click();

        cy.get('[data-cy^="invoice-history-row-total-"]').then(($items) => {
            const totals = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedTotals = [...totals].sort((a, b) => a - b);

            expect(totals).to.deep.equal(sortedTotals);
        });
    });

    it('should sort by status (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-status"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-status"]').click();

        cy.get('[data-cy^="invoice-history-row-status-"]').then(($items) => {
            const statuses = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedStatuses = [...statuses].sort((a, b) => b - a);

            expect(statuses).to.deep.equal(sortedStatuses);
        });
    });
    it('should sort by status (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-status"]').click();

        cy.get('[data-cy^="invoice-history-row-status-"]').then(($items) => {
            const statuses = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedStatuses = [...statuses].sort((a, b) => a - b);

            expect(statuses).to.deep.equal(sortedStatuses);
        });
    });

    it('test create invoice test room 701', ()=>{
        // Create room
        cy.intercept('GET', '/api/rooms**').as('getHistory');
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-2"]').click();
        cy.wait('@getHistory');
        cy.get('[data-cy="home-nav-bar-add-button"]').click();
        cy.get('[data-cy="create-room-modal-number-input"]').type('701');
        cy.get('[data-cy="create-room-modal-submit-button"]').click();

        // Create tenant & get id
        cy.intercept('POST', '/api/tenants').as('createTenantCall');

        cy.intercept('GET', '/api/tenants/with-rooms**').as('getTenants');
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-5"]').click();
        cy.wait('@getTenants');
        cy.get('[data-cy="home-nav-bar-add-button"]').click();

        cy.get('[data-cy="create-tenant-modal-name-input"]').type('สมใจ สุขสันต์');
        cy.get('[data-cy="create-tenant-modal-id-card-input"]').type('1100002030451');
        cy.get('[data-cy="create-tenant-modal-phone-input"]').type('0812225555');
        cy.get('[data-cy="create-tenant-modal-submit-button"]').click();

        // extract the ID
        cy.wait('@createTenantCall').then((interception) => {
            const newTenantId = interception.response.body.id;
            cy.log('Captured Tenant ID: ' + newTenantId);

            // Create lease
            // cy.intercept('GET', '/api/rooms**').as('getRoomsForLease');
            cy.get('[data-cy="header-menu-button"]').click();
            cy.get('[data-cy="home-page-drawer-nav-item-4"]').click();
            // cy.wait('@getRoomsForLease');

            cy.get('[data-cy="lease-history-create-lease-button"]').click();
            cy.get('[data-cy="create-lease-room-number-input"]').type('701');

            cy.get('[data-cy="create-lease-tenant-id-input"]').type(`${newTenantId}{enter}`);

            cy.get('[data-cy="create-lease-tenant-preview-name"]').should('contain', 'สมใจ');
            cy.get('[data-cy="create-lease-monthly-rent-input"]').type('2000');

            cy.get('[data-cy="create-lease-modal-submit-button"]').click();
        });
        // create invoice
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-3"]').click();

        cy.get('[data-cy="home-nav-bar-add-button"]').click();
        cy.get('[data-cy="generate-invoice-room-number-input"]').type('701');
        cy.get('[data-cy="generate-invoice-electricity-units-input"]').type('10');
        cy.get('[data-cy="generate-invoice-electricity-rate-input"]').type('7');
        cy.get('[data-cy="generate-invoice-water-units-input"]').type('10');
        cy.get('[data-cy="generate-invoice-water-rate-input"]').type('7');

        cy.intercept('GET', '/api/invoice**').as('invoiceGeneration');

        // Stub
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        cy.get('[data-cy="generate-invoice-modal-create-button"]').click();

        cy.wait('@invoiceGeneration').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.get('@windowOpen').should('be.called');

        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="home-nav-bar-actions-toolbar"]').click()
        cy.get('[data-cy="invoice-history-table-body"]')
            .find('[data-cy^="invoice-history-row-total-"]').first().should('contain', '2,140.00');
    })

    it('lease edit test', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="home-nav-bar-actions-toolbar"]').click()
        cy.get('[data-cy="invoice-history-table-body"]').find('[data-cy^="invoice-history-row-edit-button-"]').first().click();
        cy.get('[data-cy="edit-invoice-electricityRate-input"]').type('{selectall}{backspace}8');
        cy.get('[data-cy="edit-invoice-modal-save-button"]').click();

        cy.get('[data-cy="invoice-history-table-body"]')
            .find('[data-cy^="invoice-history-row-total-"]').first().should('contain', '2,150.00');
    })

    it('mark as paid test', ()=>{
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="home-nav-bar-actions-toolbar"]').click()
        cy.get('[data-cy="invoice-history-table-body"]')
            .find('[data-cy^="invoice-history-row-room-link-"]').first().click();

        cy.get('[data-cy="room-invoice-table-body"]')
            .find('[data-cy^="room-invoice-table-mark-paid-button-"]').first().click();
        cy.get('[data-cy="room-invoice-table-body"]')
            .find('[data-cy^="room-invoice-table-cell-status-"]').first().should('contain', 'ชำระแล้ว');
    });

    it('mark as paid test', ()=>{
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="home-nav-bar-actions-toolbar"]').click()
        cy.get('[data-cy="invoice-history-table-body"]')
            .find('[data-cy^="invoice-history-row-room-link-"]').first().click();

        cy.get('[data-cy="room-invoice-table-body"]')
            .find('[data-cy^="room-invoice-table-mark-unpaid-button-"]').first().click();
        cy.get('[data-cy="room-invoice-table-body"]')
            .find('[data-cy^="room-invoice-table-cell-status-"]').first().should('contain', 'ยังไม่ชำระ');
    });

    it('test create invoice in room detail - test room 701', ()=>{
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="home-nav-bar-actions-toolbar"]').click()
        cy.get('[data-cy="invoice-history-table-body"]')
            .find('[data-cy^="invoice-history-row-room-link-"]').first().click();

        // create invoice
        cy.get('[data-cy="room-detail-create-invoice-button"]').click();

        cy.get('[data-cy="generate-invoice-electricity-units-input"]').type('10');
        cy.get('[data-cy="generate-invoice-electricity-rate-input"]').type('7');
        cy.get('[data-cy="generate-invoice-water-units-input"]').type('10');
        cy.get('[data-cy="generate-invoice-water-rate-input"]').type('7');

        cy.intercept('GET', '/api/invoice**').as('invoiceGeneration');

        // Stub
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        cy.get('[data-cy="generate-invoice-modal-create-button"]').click();

        cy.wait('@invoiceGeneration').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.get('@windowOpen').should('be.called');
    })

    it('test print invoice', () => {
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="home-nav-bar-actions-toolbar"]').click()

        cy.intercept('GET', '/api/invoices/**/pdf').as('invoicePrint_1');
        cy.get('[data-cy="invoice-history-table-body"]')
            .find('[data-cy^="invoice-history-row-print-button-"]')
            .first()
            .click();

        // Stub
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        cy.get('[data-cy="invoice-history-print-confirm-submit-button"]').click();

        cy.wait('@invoicePrint_1').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.get('@windowOpen').should('be.called');
    });
    it('test pdf invoice', () => {
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="home-nav-bar-actions-toolbar"]').click()

        cy.intercept('GET', '/api/invoices/**/pdf').as('invoicePrint_1');

        // Stub
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        cy.get('[data-cy="invoice-history-table-body"]')
            .find('[data-cy^="invoice-history-row-pdf-button-"]')
            .first()
            .click();

        cy.wait('@invoicePrint_1').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.get('@windowOpen').should('be.called');
    });
    it('test print invoices (select with checkbox)', () => {
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="home-nav-bar-actions-toolbar"]').click();

        cy.get('[data-cy="invoice-history-header-select-all-checkbox"]').click();

        // Stub
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpenBulk');
        });

        cy.intercept('POST', '/api/invoices/bulk-pdf').as('invoicePrint_2');

        cy.get('[data-cy="invoice-history-bulk-print-button"]').click();

        cy.wait('@invoicePrint_2').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });

        cy.get('@windowOpenBulk').should('be.called');
    });

    it('invoice delete test & clear lease-tenant-room data', () =>{
        // delete invoice
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="home-nav-bar-actions-toolbar"]').click()
        cy.get('[data-cy="invoice-history-table-body"]')
            .find('[data-cy^="invoice-history-row-edit-button-"]').first().click();
        cy.get('[data-cy="edit-invoice-modal-delete-button"]').click();

        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="invoice-history-no-invoices-message"]').should('be.visible');

        // delete lease
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-4"]').click();

        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-edit-button-"]').first().click();
        cy.get('[data-cy="lease-edit-modal-delete-button"]').click();

        // delete tenant
        // cy.intercept('POST', '/api/tenants').as('createTenantCall');
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-5"]').click();
        // cy.wait('@createTenantCall');

        cy.get('[data-cy="smart-search-input-field"]').type('สมใจ{enter}');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-delete-button"]').first().click();
        cy.get('[data-cy="tenant-list-delete-confirm-submit-button"]').click();

        // delete room
        cy.intercept('GET', '/api/rooms**').as('getHistory');
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-2"]').click();
        cy.wait('@getHistory');

        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="room-list-table-body"]').find('[data-cy^="room-list-cell-number-"]').first().should('contain', '701').click();
        cy.get('[data-cy="room-detail-title-room-number"]').should('be.visible');
        cy.get('[data-cy="room-detail-edit-room-button"]').click();
        cy.get('[data-cy="room-edit-modal-number-input"]').should('be.visible');

        cy.get('[data-cy="room-edit-modal-delete-button"]').click();
    })

});