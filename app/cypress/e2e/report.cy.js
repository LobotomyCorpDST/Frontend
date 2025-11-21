describe('Report page test', () => {

    beforeEach(() => {
        cy.intercept('GET', '/api/tenants**').as('getData');
        cy.visit('/');
        cy.get('[data-cy="login-username-input"]').type('admin');
        cy.get('[data-cy="login-password-input"]').type('1234');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-6"]').click();
        cy.wait('@getData');
    });

    it('report filter by room', () => {
        cy.get('[data-cy="summary-report-filter-type-select"]').click();
        cy.get('[data-cy="summary-report-filter-room"]').click();
        cy.get('[data-cy="smart-search-input-field"]').type('201');
        cy.get('[data-cy="smart-search-option-201"]').click();

        cy.get('[data-cy="summary-report-invoice-table-body"]')
            .find('[data-cy^="summary-report-invoice-cell-room-"]').first().should('contain', '201');
    });

    it('report filter by room-month', () => {
        cy.get('[data-cy="summary-report-filter-type-select"]').click();
        cy.get('[data-cy="summary-report-filter-room"]').click();
        cy.get('[data-cy="smart-search-input-field"]').type('201');
        cy.get('[data-cy="smart-search-option-201"]').click();
        cy.get('[data-cy="summary-report-room-month-filter-checkbox"]').click();

        cy.get('[data-cy="summary-report-invoice-table-body"]')
            .find('[data-cy^="summary-report-invoice-cell-monthyear-"]').first().should('contain', '11/2025');
    });

    it('report filter by tenant', () => {
        cy.get('[data-cy="summary-report-filter-type-select"]').click();
        cy.get('[data-cy="summary-report-filter-tenant"]').click();
        cy.get('[data-cy="smart-search-input-field"]').click();
        cy.get('[data-cy="smart-search-option-1"]').click();
        cy.get('[data-cy="summary-report-invoice-cell-tenant-1"]').should('contain', 'Jessica Lopez');
    });

    it('report filter by month', () => {
        cy.get('[data-cy="summary-report-filter-type-select"]').click();
        cy.get('[data-cy="summary-report-filter-month"]').click();

        cy.get('[data-cy="summary-report-invoice-table-body"]')
            .find('[data-cy^="summary-report-invoice-cell-monthyear-"]').first().should('contain', '11/2025');
    });

    it('graph test', () => {
        cy.get('[data-cy="summary-report-filter-type-select"]').click();
        cy.get('[data-cy="summary-report-filter-month"]').click();
        cy.get('[data-cy="summary-report-invoice-table-body"]')
            .find('[data-cy^="summary-report-invoice-cell-monthyear-"]').first().should('contain', '11/2025');

        cy.get('[data-cy="summary-report-view-toggle-graph-button"]').click();
        cy.get('[data-cy="month-rooms-chart-container"]').should('be.visible');
    });

    it('graph in baht test', () => {
        cy.get('[data-cy="summary-report-filter-type-select"]').click();
        cy.get('[data-cy="summary-report-filter-month"]').click();
        cy.get('[data-cy="summary-report-invoice-table-body"]')
            .find('[data-cy^="summary-report-invoice-cell-monthyear-"]').first().should('contain', '11/2025');
        
        cy.get('[data-cy="summary-report-view-toggle-graph-button"]').click();
        cy.get('[data-cy="month-rooms-chart-container"]').should('be.visible');
        cy.get('[data-cy="summary-report-page"] button[value="baht"]').click();
        cy.get('[data-cy="month-rooms-chart-container"]').should('contain', '(บาท)');
    });
});