describe('Room list page test', () => {

    beforeEach(() => {
        cy.intercept('GET', '/api/user**').as('getHistory');
        cy.visit('/');
        cy.get('[data-cy="login-username-input"]').type('Admin');
        cy.get('[data-cy="login-password-input"]').type('1234');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-8"]').click();

        cy.wait('@getHistory');
    });
    it('smart search by username', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('somsak2{enter}');
        cy.get('[data-cy="user-management-table-body"]').find('[data-cy^="user-management-cell-username-"]').first().should('contain', 'somsak2');
    })
    it('smart search by role', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('user{enter}');
        cy.get('[data-cy="user-management-table-body"]').find('[data-cy^="user-management-cell-role-"]').first().should('contain', 'USER');
    })
    it('smart search by room no', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('102{enter}');
        cy.get('[data-cy="user-management-table-body"]').find('[data-cy^="user-management-cell-room-"]').first().should('contain', 'ห้อง 102');
    })
    it('should sort by ID (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-id"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-id"]').click();

        cy.get('[data-cy^="user-management-cell-id-"]').then(($items) => {
            const ids = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedIds = [...ids].sort((a, b) => b - a);

            expect(ids).to.deep.equal(sortedIds);
        });
    });
    it('should sort by ID (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-id"]').click();

        cy.get('[data-cy^="user-management-cell-id-"]').then(($items) => {
            const ids = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedIds = [...ids].sort((a, b) => a - b);

            expect(ids).to.deep.equal(sortedIds);
        });
    });
    it('should sort by username (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-username"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-username"]').click();

        cy.get('[data-cy^="user-management-cell-username-"]').then(($items) => {
            const usernames = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedUsernames = [...usernames].sort((a, b) => b - a);

            expect(usernames).to.deep.equal(sortedUsernames);
        });
    });
    it('should sort by username (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-username"]').click();

        cy.get('[data-cy^="user-management-cell-username-"]').then(($items) => {
            const usernames = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedUsernames = [...usernames].sort((a, b) => a - b);

            expect(usernames).to.deep.equal(sortedUsernames);
        });
    });
    it('should sort by role (desc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-role"]').click();
        cy.get('[data-cy="standard-table-header-sort-label-role"]').click();

        cy.get('[data-cy^="user-management-cell-role-"]').then(($items) => {
            const roles = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedRoles = [...roles].sort((a, b) => b - a);

            expect(roles).to.deep.equal(sortedRoles);
        });
    });
    it('should sort by role (asc)', () => {
        cy.get('[data-cy="standard-table-header-sort-label-role"]').click();

        cy.get('[data-cy^="user-management-cell-role-"]').then(($items) => {
            const roles = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedRoles = [...roles].sort((a, b) => a - b);

            expect(roles).to.deep.equal(sortedRoles);
        });
    });

    it('create USER user test', () => {
        cy.get('[data-cy="user-management-create-user-button"]').click();
        cy.get('[data-cy="create-user-modal-username-input"]').type('somjai');
        cy.get('[data-cy="create-user-modal-password-input"]').type('somjai123');
        cy.get('[data-cy="create-user-modal-confirm-password-input"]').type('somjai123');
        cy.get('[data-cy="create-user-modal-role-select"]').click();
        cy.get('[data-cy="create-user-modal-role-option-user"]').click();
        cy.get('[data-cy="create-user-modal-room-info-alert"]').should('be.visible');
        cy.get('[data-cy="create-user-modal-room-numbers-input"]').type('601');

        cy.get('[data-cy="create-user-modal-submit-button"]').click();

        // test login
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-logout-button"]').click();
        cy.get('[data-cy="login-username-input"]').type('somjai');
        cy.get('[data-cy="login-password-input"]').type('somjai123');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="dashboard-stats-total-rooms"]').should('contain', '1');
    })

    it('create STAFF user test', () => {
        cy.get('[data-cy="user-management-create-user-button"]').click();
        cy.get('[data-cy="create-user-modal-username-input"]').type('The staff');
        cy.get('[data-cy="create-user-modal-password-input"]').type('staff555');
        cy.get('[data-cy="create-user-modal-confirm-password-input"]').type('staff555');
        cy.get('[data-cy="create-user-modal-role-select"]').click();
        cy.get('[data-cy="create-user-modal-role-option-staff"]').click();

        cy.get('[data-cy="create-user-modal-submit-button"]').click();

        // test login
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-logout-button"]').click();
        cy.get('[data-cy="login-username-input"]').type('The staff');
        cy.get('[data-cy="login-password-input"]').type('staff555');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-2"]').should('contain', 'คลังวัสดุ');
    })

    it('create ADMIN user test', () => {
        cy.get('[data-cy="user-management-create-user-button"]').click();
        cy.get('[data-cy="create-user-modal-username-input"]').type('The admin');
        cy.get('[data-cy="create-user-modal-password-input"]').type('admin555');
        cy.get('[data-cy="create-user-modal-confirm-password-input"]').type('admin555');
        cy.get('[data-cy="create-user-modal-role-select"]').click();
        cy.get('[data-cy="create-user-modal-role-option-admin"]').click();

        cy.get('[data-cy="create-user-modal-submit-button"]').click();

        // test login
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-logout-button"]').click();
        cy.get('[data-cy="login-username-input"]').type('The admin');
        cy.get('[data-cy="login-password-input"]').type('admin555');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-2"]').should('contain', 'ห้องทั้งหมด');
    })

    it('change password user test', () => {
        cy.get('[data-cy="smart-search-input-field"]').type('somjai{enter}');
        cy.get('[data-cy="user-management-table-body"]')
            .find('[data-cy^="user-management-edit-button-"]').first().click();
        cy.get('[data-cy="edit-user-modal-toggle-password-section-button"]').click();
        cy.get('[data-cy="edit-user-modal-new-password-input"]').type('somjai555');
        cy.get('[data-cy="edit-user-modal-confirm-password-input"]').type('somjai555');

        cy.get('[data-cy="edit-user-modal-password-submit-button"]').click();
        cy.get('[data-cy="edit-user-modal-save-button"]').click();

        // test login
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-logout-button"]').click();
        cy.get('[data-cy="login-username-input"]').type('somjai');
        cy.get('[data-cy="login-password-input"]').type('somjai555');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="dashboard-stats-total-rooms"]').should('contain', '1');
    })

    it('edit change role test', () => {
        cy.get('[data-cy="smart-search-input-field"]').type('The staff{enter}');
        cy.get('[data-cy="user-management-table-body"]')
            .find('[data-cy^="user-management-edit-button-"]').first().click();
        cy.get('[data-cy="edit-user-modal-role-select"]').click();
        cy.get('[data-cy="edit-user-modal-role-option-admin"]').click();

        cy.get('[data-cy="edit-user-modal-save-button"]').click();

        // test login
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-logout-button"]').click();
        cy.get('[data-cy="login-username-input"]').type('The staff');
        cy.get('[data-cy="login-password-input"]').type('staff555');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-2"]').should('contain', 'ห้องทั้งหมด');
    })
    it('user delete test & data clean up', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('somjai{enter}');
        cy.get('[data-cy="user-management-table-body"]')
            .find('[data-cy^="user-management-delete-button-"]').click();
        cy.get('[data-cy="user-management-delete-confirm-submit-button"]').click();

        cy.get('[data-cy="smart-search-input-field"]').type('The staff{enter}');
        cy.get('[data-cy="user-management-table-body"]')
            .find('[data-cy^="user-management-delete-button-"]').click();
        cy.get('[data-cy="user-management-delete-confirm-submit-button"]').click();

        cy.get('[data-cy="smart-search-input-field"]').type('The admin{enter}');
        cy.get('[data-cy="user-management-table-body"]')
            .find('[data-cy^="user-management-delete-button-"]').click();
        cy.get('[data-cy="user-management-delete-confirm-submit-button"]').click();
    })
});