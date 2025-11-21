describe('App Login and Dashboard test', () => {

    beforeEach(() => {
        cy.visit('/');
    });

    it('Guest login and logout flow', () => {
        cy.get('[data-cy="login-guest-button"]').click();
        cy.get('[data-cy="header-title"]').should('be.visible');

        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="guest-home-page-drawer-logout-button"]').click();
    });

    it('Admin login and logout flow', () => {
        cy.get('[data-cy="login-username-input"]').type('Admin');
        cy.get('[data-cy="login-password-input"]').type('1234');
        cy.get('[data-cy="login-submit-button"]').click();

        cy.get('[data-cy="dashboard-room-card-201"]').should('be.visible');
        cy.get('[data-cy="dashboard-room-card-201"]').click();

        cy.get('[data-cy="room-detail-back-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-logout-button"]').click();
    });
});