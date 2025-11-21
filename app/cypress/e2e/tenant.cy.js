describe('Tenant list page test', () => {

    beforeEach(() => {
        cy.intercept('GET', '/api/tenants/with-rooms**').as('getTenants');
        cy.visit('/');
        cy.get('[data-cy="login-username-input"]').type('admin');
        cy.get('[data-cy="login-password-input"]').type('1234');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-5"]').click();
        cy.wait('@getTenants');
    });

    it('link to tenant detail (click row)', ()=>{
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-row-"]').first().click();
        cy.get('[data-cy="tenant-detail-tenant-name-title"]').should('be.visible');
        cy.get('[data-cy="tenant-detail-back-button"]').click();
    });

    it('smart search by tenant id', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('47{enter}');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-id-"]').first().should('contain', '47');
    });
    it('smart search by tenant name', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('Matthew{enter}');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-name-"]').first().should('contain', 'Matthew');
    });
    it('smart search by room number', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('201{enter}');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-rooms-"]').first().should('contain', '201');
    });

    it('should sort by ID (asc)', () => {
        cy.get('[data-cy="standard-table-header-cell-id"]').click();

        cy.get('[data-cy^="tenant-list-cell-id-"]').then(($items) => {
            const ids = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedIds = [...ids].sort((a, b) => a - b);

            expect(ids).to.deep.equal(sortedIds);
        });
    });
    it('should sort by ID (desc)', () => {
        cy.get('[data-cy="standard-table-header-cell-id"]').click();
        cy.get('[data-cy="standard-table-header-cell-id"]').click();

        cy.get('[data-cy^="tenant-list-cell-id-"]').then(($items) => {
            const ids = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedIds = [...ids].sort((a, b) => b - a);

            expect(ids).to.deep.equal(sortedIds);
        });
    });
    it('should sort by name (asc)', () => {
        cy.get('[data-cy="standard-table-header-cell-name"]').click();

        cy.get('[data-cy^="tenant-list-cell-name-"]').then(($items) => {
            const names = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedNames = [...names].sort((a, b) => a - b);

            expect(names).to.deep.equal(sortedNames);
        });
    });
    it('should sort by name (desc)', () => {
        cy.get('[data-cy="standard-table-header-cell-name"]').click();
        cy.get('[data-cy="standard-table-header-cell-name"]').click();

        cy.get('[data-cy^="tenant-list-cell-name-"]').then(($items) => {
            const names = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedNames = [...names].sort((a, b) => b - a);

            expect(names).to.deep.equal(sortedNames);
        });
    });
    it('should sort by phone (asc)', () => {
        cy.get('[data-cy="standard-table-header-cell-phone"]').click();

        cy.get('[data-cy^="tenant-list-cell-phone-"]').then(($items) => {
            const phones = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedPhones = [...phones].sort((a, b) => a - b);

            expect(phones).to.deep.equal(sortedPhones);
        });
    });
    it('should sort by phone (desc)', () => {
        cy.get('[data-cy="standard-table-header-cell-phone"]').click();
        cy.get('[data-cy="standard-table-header-cell-phone"]').click();

        cy.get('[data-cy^="tenant-list-cell-phone-"]').then(($items) => {
            const phones = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedPhones = [...phones].sort((a, b) => b - a);

            expect(phones).to.deep.equal(sortedPhones);
        });
    });
    it('should sort by phone (asc)', () => {
        cy.get('[data-cy="standard-table-header-cell-lineId"]').click();

        cy.get('[data-cy^="tenant-list-cell-line-"]').then(($items) => {
            const lineIds = Cypress._.map($items, (el) => parseInt(el.innerText));
            const sortedLineIds = [...lineIds].sort((a, b) => a - b);

            expect(lineIds).to.deep.equal(sortedLineIds);
        });
    });
    it('should sort by phone (desc)', () => {
        cy.get('[data-cy="standard-table-header-cell-lineId"]').click();
        cy.get('[data-cy="standard-table-header-cell-lineId"]').click();

        cy.get('[data-cy^="tenant-list-cell-line-"]').then(($items) => {
            const lineIds = Cypress._.map($items, (el) => parseInt(el.innerText));

            const sortedLineIds = [...lineIds].sort((a, b) => b - a);

            expect(lineIds).to.deep.equal(sortedLineIds);
        });
    });
    it('test create tenant test somjai', ()=>{
        cy.get('[data-cy="home-nav-bar-add-button"]').click();
        cy.get('[data-cy="create-tenant-modal-name-input"]').type('สมใจ สุขสันต์');
        cy.get('[data-cy="create-tenant-modal-id-card-input"]').type('1100002030451');
        cy.get('[data-cy="create-tenant-modal-phone-input"]').type('0812225555');
        cy.get('[data-cy="create-tenant-modal-line-id-input"]').type('somjai_sudsuay');
        cy.get('[data-cy="create-tenant-modal-email-input"]').type('somjai@sommail.com');

        cy.get('[data-cy="create-tenant-modal-submit-button"]').click();
        cy.get('[data-cy="smart-search-input-field"]').type('สมใจ สุขสันต์{enter}');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-name-"]').first().should('contain', 'สมใจ สุขสันต์');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-phone-"]').first().should('contain', '0812225555');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-line-"]').first().should('contain', 'somjai_sudsuay');
    })
    it('test edit tenant test somjai', ()=>{
        cy.get('[data-cy="smart-search-input-field"]').type('สมใจ สุขสันต์{enter}');

        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-edit-button"]').first().click();
        cy.get('[data-cy="edit-tenant-modal-name-input"]').type('{selectall}{backspace}สมใจ สุดสวยสุขสันต์');
        cy.get('[data-cy="edit-tenant-modal-id-card-input"]').type('{selectall}{backspace}1100002030452');
        cy.get('[data-cy="edit-tenant-modal-phone-input"]').type('{selectall}{backspace}0812225556');
        cy.get('[data-cy="edit-tenant-modal-line-id-input"]').type('{selectall}{backspace}somjai_sudsuay<3');
        cy.get('[data-cy="edit-tenant-modal-email-input"]').type('{selectall}{backspace}somjai_ja@sommail.com');

        cy.get('[data-cy="edit-tenant-modal-save-button"]').click();
        cy.get('[data-cy="smart-search-input-field"]').type('สมใจ สุดสวยสุขสันต์{enter}');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-name-"]').first().should('contain', 'สมใจ สุดสวยสุขสันต์');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-phone-"]').first().should('contain', '0812225556');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-cell-line-"]').first().should('contain', 'somjai_sudsuay<3');
    })
    it('test delete tenant test somjai', ()=>{
        cy.get('[data-cy="smart-search-input-field"]').type('สมใจ สุดสวยสุขสันต์{enter}');
        cy.get('[data-cy="tenant-list-table-body"]').find('[data-cy^="tenant-list-delete-button"]').first().click();
        cy.get('[data-cy="tenant-list-delete-confirm-submit-button"]').click();

        cy.get('[data-cy="smart-search-input-field"]').type('สมใจ สุดสวยสุขสันต์{enter}');
        cy.get('[data-cy="tenant-list-no-data-row"]').should('be.visible');
    })
});