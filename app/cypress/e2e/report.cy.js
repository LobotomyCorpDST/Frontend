// describe('Tenant list page test', () => {
//
//     beforeEach(() => {
//         cy.intercept('GET', '/api/report**').as('getReport');
//         cy.visit('/');
//         cy.get('[data-cy="login-username-input"]').type('admin');
//         cy.get('[data-cy="login-password-input"]').type('1234');
//         cy.get('[data-cy="login-submit-button"]').click();
//         cy.get('[data-cy="header-menu-button"]').click();
//         cy.get('[data-cy="home-page-drawer-nav-item-6"]').click();
//         cy.wait('@getReport');
//     });
//
//     it('link to tenant detail (click row)', () => {
//         cy.get('[data-cy="summary-report-filter-type-select"]').click();
//         cy.get('[data-cy="tenant-detail-tenant-name-title"]').should('be.visible');
//         cy.get('[data-cy="tenant-detail-back-button"]').click();
//     });
// });