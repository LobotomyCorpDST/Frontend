describe('Lease list page test', () => {

    beforeEach(() => {
        cy.intercept('GET', '/api/rooms**').as('getHistory');
        cy.visit('/');
        cy.get('[data-cy="login-username-input"]').type('Admin');
        cy.get('[data-cy="login-password-input"]').type('1234');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-4"]').click();

        cy.wait('@getHistory');
    });
    it('smart search by room number', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('201{enter}');
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-room-"]').first().should('contain', '201');
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-room-"]').first().click();
    })

    it('smart search by invoice id', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('43{enter}');
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-room-"]').first().should('contain', '1101');
    })

    it('smart search by name', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('สมชาย{enter}');
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-tenant-"]').first().should('contain', 'สมชาย');
    })

    it('open edit modal (click row)', () =>{
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-"]').first().click();
        cy.get('[data-cy="lease-edit-modal-title"]').should('be.visible');
    })

    it('test create lease (add tenant somjai to created room 701)', () => {
        // Create free room
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
    });

    it('lease edit test', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-edit-button-"]').first().click();
        cy.get('[data-cy="lease-edit-end-date-input"]').type('2027-12-31');
        cy.get('[data-cy="lease-edit-modal-save-button"]').click();

        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-end-date-"]').first().should('contain', '2027-12-31');
    })
    it('lease edit (end lease & mark deposit returned)', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-edit-button-"]').first().click();
        cy.get('[data-cy="lease-edit-status-select"]').click();
        cy.get('[data-cy="lease-edit-status-option-ended"]').click();
        cy.get('[data-cy="lease-edit-settled-checkbox"]').click();
        cy.get('[data-cy="lease-edit-settled-date-input"]').type('2028-01-01');
        cy.get('[data-cy="lease-edit-modal-save-button"]').click();

        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-status-"]').first().should('contain', 'ครบกำหนดสัญญา');
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-settled-"]').first().should('contain', 'คืนแล้ว (2028-01-01)');
    })

    it('test add pictures', ()=>{
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-edit-button-"]').first().click();

        cy.get('[data-cy="doc-upload-select-file-button"]').selectFile('cypress/fixtures/Maintenance_test_pic.jpg');
        cy.get('[data-cy="doc-upload-list-container"]').should('not.be.empty');
        cy.get('[data-cy="doc-upload-list-container"]').find('[data-cy^="doc-upload-list-item-name-"]').last().should('contain', 'Maintenance_test_pic.jpg');
        cy.get('[data-cy="lease-edit-modal-save-button"]').click();
    })

    it('test download pictures', () => {
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-edit-button-"]').first().click();

        cy.get('[data-cy="doc-upload-list-container"]').should('not.be.empty');

        cy.intercept('GET', '/api/documents/*/download').as('fileDownload');

        cy.get('[data-cy="doc-upload-list-container"]')
            .find('[data-cy^="doc-upload-list-item-download-button-"]')
            .last()
            .click();

        cy.wait('@fileDownload').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });

        cy.get('[data-cy="lease-edit-modal-save-button"]').click();
    });

    it('test upload a picture using drag-and-drop', () => {
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-edit-button-"]').first().click();

        cy.get('[data-cy="doc-upload-dropzone"]')
            .selectFile('cypress/fixtures/Maintenance_test_pic.jpg', {
                action: 'drag-drop'
            });

        cy.get('[data-cy="doc-upload-list-container"]').find('[data-cy^="doc-upload-list-item-name-"]').last().should('contain', 'Maintenance_test_pic.jpg');
    });

    it('test delete pictures', ()=>{
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-edit-button-"]').first().click();

        cy.get('[data-cy="doc-upload-list-container"]').should('not.be.empty');

        cy.get('[data-cy="doc-upload-list-container"]').find('[data-cy^="doc-upload-list-item-delete-button-"]').last().click()
        cy.get('[data-cy="lease-edit-modal-save-button"]').click();
    })

    it('test download lease', () => {
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');

        cy.intercept('GET', '/api/leases/**/print').as('leaseDownload_1');

        // Stub
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        cy.get('[data-cy="lease-history-table-body"]')
            .find('[data-cy^="lease-history-row-print-button-"]')
            .first()
            .click();

        cy.wait('@leaseDownload_1').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.get('@windowOpen').should('be.called');
    });

    it('test download lease (select with checkbox)', () => {
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');

        cy.get('[data-cy="lease-history-table-body"]')
            .find('[data-cy^="lease-history-row-select-checkbox-"]')
            .first()
            .click();

        // Stub
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpenBulk');
        });

        cy.intercept('GET', '/api/lease**').as('leaseDownload_2');

        cy.get('[data-cy="lease-history-bulk-print-button"]').click();

        // Verify triggered
        cy.get('@windowOpenBulk').should('be.called');
    });

    it('lease delete test & clear tenant-room data', () =>{
        // delete lease
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="lease-history-table-body"]').find('[data-cy^="lease-history-row-edit-button-"]').first().click();
        cy.get('[data-cy="lease-edit-modal-delete-button"]').click();

        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="lease-history-no-data-message"]').should('be.visible');

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