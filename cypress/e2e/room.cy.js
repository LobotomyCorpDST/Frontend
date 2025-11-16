describe('Maintenance page test', () => {

    beforeEach(() => {
        cy.intercept('GET', '/api/rooms**').as('getHistory');
        cy.visit('/');
        cy.get('[data-cy="login-username-input"]').type('Admin');
        cy.get('[data-cy="login-password-input"]').type('1234');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-2"]').click();

        cy.wait('@getHistory');
    });
    it('link to room detail', ()=>{
        cy.get('[data-cy="maintenance-history-room-link-button-300"]').click(); // cannot find element
        cy.get('[data-cy="room-detail-title-room-number"]').should('be.visible');
        cy.get('[data-cy="room-detail-back-button"]').click();
    });

});