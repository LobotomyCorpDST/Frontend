describe('Room list page test', () => {

    beforeEach(() => {
        cy.intercept('GET', '/api/supplies**').as('getHistory');
        cy.visit('/');
        cy.get('[data-cy="login-username-input"]').type('Admin');
        cy.get('[data-cy="login-password-input"]').type('1234');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-7"]').click();

        cy.wait('@getHistory');
    });
    it('smart search by item name', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('Door Lock{enter}');
        cy.get('[data-cy="supply-inventory-table-body"]')
            .find('[data-cy^="supply-inventory-cell-name-"]').first().should('contain', 'Door Lock');
    })
    it('smart search by item amount', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('5{enter}');
        cy.get('[data-cy="supply-inventory-table-body"]')
            .find('[data-cy^="supply-inventory-cell-amount-"]').first().should('contain', '5');
    })

    it('should sort by item name (desc)', () => {
        cy.get('[data-cy="standard-table-header-cell-supplyName"]').click();
        cy.get('[data-cy="standard-table-header-cell-supplyName"]').click();

        cy.get('[data-cy^="supply-inventory-cell-name-"]').then(($items) => {
            const items = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedItems = [...items].sort((a, b) => b - a);

            expect(items).to.deep.equal(sortedItems);
        });
    });
    it('should sort by item name (asc)', () => {
        cy.get('[data-cy="standard-table-header-cell-supplyName"]').click();

        cy.get('[data-cy^="supply-inventory-cell-name-"]').then(($items) => {
            const items = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedItems = [...items].sort((a, b) => a - b);

            expect(items).to.deep.equal(sortedItems);
        });
    });
    it('should sort by amount (desc)', () => {
        cy.get('[data-cy="standard-table-header-cell-supplyAmount"]').click();
        cy.get('[data-cy="standard-table-header-cell-supplyAmount"]').click();

        cy.get('[data-cy^="supply-inventory-cell-amount-"]').then(($items) => {
            const amounts = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedAmounts = [...amounts].sort((a, b) => b - a);

            expect(amounts).to.deep.equal(sortedAmounts);
        });
    });
    it('should sort by amount (asc)', () => {
        cy.get('[data-cy="standard-table-header-cell-supplyAmount"]').click();

        cy.get('[data-cy^="supply-inventory-cell-amount-"]').then(($items) => {
            const amounts = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedAmounts = [...amounts].sort((a, b) => a - b);

            expect(amounts).to.deep.equal(sortedAmounts);
        });
    });

    it('create item test', () => {
        cy.get('[data-cy="supply-inventory-add-button"]').click();

        cy.get('[data-cy^="add-supply-modal-name-input"]').type('Sofa');
        cy.get('[data-cy^="add-supply-modal-amount-input"]').type('{selectall}{backspace}5');
        cy.get('[data-cy^="add-supply-modal-submit-button"]').click();
    });
    it('edit item test', () => {
        cy.get('[data-cy="smart-search-input-field"]').type('Sofa{enter}');
        cy.get('[data-cy="supply-inventory-table-body"]')
            .find('[data-cy^="supply-inventory-edit-button-"]').first().click();
        cy.get('[data-cy="supply-inventory-table-body"]')
            .find('[data-cy^="supply-inventory-edit-name-input"]').first().type('{selectall}{backspace}Sofa bed');
        cy.get('[data-cy="supply-inventory-table-body"]')
            .find('[data-cy^="supply-inventory-edit-amount-input"]').first().type('{selectall}{backspace}3');

        cy.get('[data-cy="supply-inventory-table-body"]')
            .find('[data-cy^="supply-inventory-save-button"]').first().click();

        cy.get('[data-cy="supply-inventory-table-body"]')
            .find('[data-cy^="supply-inventory-cell-amount-"]').first().should('contain', '3');
    });

    it('low stock test', () => {
        cy.get('[data-cy="smart-search-input-field"]').type('Sofa bed{enter}');
        cy.get('[data-cy="supply-inventory-table-body"]')
            .find('[data-cy^="supply-inventory-decrement-button-"]').first().click();

        cy.get('[data-cy="supply-inventory-table-body"]')
            .find('[data-cy^="supply-inventory-low-stock-chip-"]').first().should('be.visible');
    });

    it('delete item test', () => {
        cy.get('[data-cy="smart-search-input-field"]').type('Sofa bed{enter}');
        cy.get('[data-cy="supply-inventory-table-body"]')
            .find('[data-cy^="supply-inventory-delete-button-"]').first().click();

        cy.get('[data-cy="supply-inventory-no-data-row"]').should('be.visible');
    });
});