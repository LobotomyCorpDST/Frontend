describe('Room list page test', () => {

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

});