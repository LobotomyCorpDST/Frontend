describe('Tenant list page test', () => {

    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.intercept('GET', '/api/tenants/with-rooms**').as('getTenants');
        cy.visit('/');
        cy.get('[data-cy="login-username-input"]').type('somsak2');
        cy.get('[data-cy="login-password-input"]').type('1234');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-5"]').click();
        cy.wait('@getTenants');
        cy.pause();
    });

    it('link to tenant detail (click row)', ()=>{
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-row-"]').first().click();
        cy.get('[data-cy="tenant-detail-tenant-name-title"]').should('be.visible');
        cy.get('[data-cy="tenant-detail-back-button"]').click();
    });

    it('smart search by tenant id', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('33{enter}');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-id-"]').first().should('contain', '33');
    });
    it('smart search by tenant name', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('Matthew{enter}');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-name-"]').first().should('contain', 'Matthew');
    });
    it('smart search by room number', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('201{enter}');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-rooms-"]').first().should('contain', '201');
    });

    it('sort by id (desc)', () =>{
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-id-"]').first().should('not.contain', '1');
    });
    // it('sort by name (asc)', () =>{
    //     cy.get('[data-cy="standard-table-header-cell-id"]').click();
    //     cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-id-"]')
    //         .then(($items) => {
    //             const names = Cypress._.map($items, (el) => el.innerText.trim());
    //             const sortedNames = [...names].sort((a, b) => {
    //                 return a.localeCompare(b);
    //             });
    //             expect(names).to.deep.equal(sortedNames);
    //         });
    // });

});