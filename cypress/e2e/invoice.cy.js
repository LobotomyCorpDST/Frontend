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
        cy.get('[data-cy="invoice-history-table"]').find('[data-cy^="invoice-history-row-room-"]').first().click();
        cy.get('[data-cy="room-detail-title-room-number"]').should('be.visible');
        cy.get('[data-cy="room-detail-back-button"]').click();
    })
    it('smart search by room number', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('201{enter}');
        cy.get('[data-cy="invoice-history-table-body"]').find('[data-cy^="invoice-history-row-room-"]').first().should('contain', '201');
        cy.get('[data-cy="invoice-history-table-body"]').find('[data-cy^="invoice-history-row-room-"]').first().click();
    })

    it('smart search by invoice id', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('184{enter}');
        cy.get('[data-cy="invoice-history-table-body"]').find('[data-cy^="invoice-history-row-id-"]').first().should('contain', '184');
    })

    it('smart search by room number', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('4004{enter}');
        cy.get('[data-cy="invoice-history-table-body"]').find('[data-cy^="invoice-history-row-total-"]').first().should('contain', '4,004');
    })

});