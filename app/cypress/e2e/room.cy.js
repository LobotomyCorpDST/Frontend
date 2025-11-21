describe('Room list page test', () => {

    beforeEach(() => {
        cy.intercept('GET', '/api/rooms**').as('getHistory');
        cy.visit('/');
        cy.get('[data-cy="login-username-input"]').type('Admin');
        cy.get('[data-cy="login-password-input"]').type('1234');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-2"]').click();

        cy.wait('@getHistory');

        // ensure its loaded
        cy.get('[data-cy="room-list-table-body"]')
            .should('be.visible')
            .find('[data-cy^="room-list-row-"]')
            .should('have.length.gt', 0);
    });
    it('link to room detail (click row)', ()=>{
        cy.get('[data-cy="room-list-table-body"]').find('[data-cy^="room-list-row-"]').first().click();
        cy.get('[data-cy="room-detail-title-room-number"]').should('be.visible');
    });
    it('link to room detail (click room no.)', ()=>{
        cy.get('[data-cy="room-list-table-body"]').find('[data-cy^="room-list-cell-number-"]').first().click();
        cy.get('[data-cy="room-detail-title-room-number"]').should('be.visible');
    })
    it('smart search by room no', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('201{enter}');
        cy.get('[data-cy="room-list-table-body"]').find('[data-cy^="room-list-cell-number-"]').first().should('contain', '201');
    })

    it('smart search by name', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('สมชาย{enter}');
        cy.get('[data-cy="room-list-table-body"]').find('[data-cy^="room-list-cell-tenant-"]').first().should('contain', 'สมชาย');
    })
    it('should sort by ID (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-roomNumber"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-roomNumber"]').click();

        cy.get('[data-cy^="room-list-cell-number-"]').then(($items) => {
            const rooms = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedRooms = [...rooms].sort((a, b) => b - a);

            expect(rooms).to.deep.equal(sortedRooms);
        });
    });
    it('should sort by ID (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-roomNumber"]').click();

        cy.get('[data-cy^="room-list-cell-number-"]').then(($items) => {
            const rooms = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedRooms = [...rooms].sort((a, b) => a - b);

            expect(rooms).to.deep.equal(sortedRooms);
        });
    });

    it('should sort by tenant name (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-occupantName"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-occupantName"]').click();

        cy.get('[data-cy^="room-list-cell-tenant-"]').then(($items) => {
            const names = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedNames = [...names].sort((a, b) => b - a);

            expect(names).to.deep.equal(sortedNames);
        });
    });
    it('should sort by tenant name (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-occupantName"]').click();

        cy.get('[data-cy^="room-list-cell-tenant-"]').then(($items) => {
            const names = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedNames = [...names].sort((a, b) => a - b);

            expect(names).to.deep.equal(sortedNames);
        });
    });

    it('should sort by lease end date (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-leaseEndDate"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-leaseEndDate"]').click();

        cy.get('[data-cy^="room-list-cell-lease-end-"]').then(($items) => {
            const endDates = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedEndDates = [...endDates].sort((a, b) => b - a);

            expect(endDates).to.deep.equal(sortedEndDates);
        });
    });
    it('should sort by lease end date (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-leaseEndDate"]').click();

        cy.get('[data-cy^="room-list-cell-lease-end-"]').then(($items) => {
            const endDates = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedEndDates = [...endDates].sort((a, b) => a - b);

            expect(endDates).to.deep.equal(sortedEndDates);
        });
    });

    it('should sort by room status (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-roomStatus"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-roomStatus"]').click();

        cy.get('[data-cy^="room-list-cell-status-"]').then(($items) => {
            const statuses = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedStatuses = [...statuses].sort((a, b) => b - a);

            expect(statuses).to.deep.equal(sortedStatuses);
        });
    });
    it('should sort by room status (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-roomStatus"]').click();

        cy.get('[data-cy^="room-list-cell-status-"]').then(($items) => {
            const statuses = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedStatuses = [...statuses].sort((a, b) => a - b);

            expect(statuses).to.deep.equal(sortedStatuses);
        });
    });

    it('should sort by maintenance status (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-maintenanceStatus"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-maintenanceStatus"]').click();

        cy.get('[data-cy^="room-list-cell-maintenance-"]').then(($items) => {
            const maintenances = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedMaintenances = [...maintenances].sort((a, b) => b - a);

            expect(maintenances).to.deep.equal(sortedMaintenances);
        });
    });
    it('should sort by maintenance status (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-maintenanceStatus"]').click();

        cy.get('[data-cy^="room-list-cell-maintenance-"]').then(($items) => {
            const maintenances = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedMaintenances = [...maintenances].sort((a, b) => a - b);

            expect(maintenances).to.deep.equal(sortedMaintenances);
        });
    });

    it('test create room test 701', ()=>{
        cy.get('[data-cy="home-nav-bar-add-button"]').click();
        cy.get('[data-cy="create-room-modal-number-input"]').type('701');

        cy.get('[data-cy="create-room-modal-submit-button"]').click();

    })
    it('test delete room test 701', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
        cy.get('[data-cy="room-list-table-body"]').find('[data-cy^="room-list-cell-number-"]').first().should('contain', '701').click();
        cy.get('[data-cy="room-detail-title-room-number"]').should('be.visible');
        cy.get('[data-cy="room-detail-edit-room-button"]').click();
        cy.get('[data-cy="room-edit-modal-number-input"]').should('be.visible');

        cy.get('[data-cy="room-edit-modal-delete-button"]').click();
    })

});