describe('Room list page test', () => {

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
    it('link to room detail (click row)', ()=>{
        cy.get('[data-cy="room-list-row-61"]').click();
        cy.get('[data-cy="room-detail-title-room-number"]').should('be.visible');
        cy.get('[data-cy="room-detail-back-button"]').click();
    });
    it('link to room detail (click room no.)', ()=>{
        cy.get('[data-cy="room-list-room-link-18"]').click();
        cy.get('[data-cy="room-detail-title-room-number"]').should('be.visible');
        cy.get('[data-cy="room-detail-back-button"]').click();
    })
    it('smart search by room no', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('201{enter}');
        cy.get('[data-cy="room-list-table-body"]').find('[data-cy^="room-list-cell-number-"]').first().should('contain', '201');
        cy.get('[data-cy="room-list-table-body"]').find('[data-cy^="room-list-cell-number-"]').first().click();
        cy.get('[data-cy="room-detail-title-room-number"]').should('be.visible');
        cy.get('[data-cy="room-detail-back-button"]').click();
    })

    it('smart search by name', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('สมชาย{enter}');
        cy.get('[data-cy="room-list-table-body"]').find('[data-cy^="room-list-cell-tenant-"]').first().should('contain', 'สมชาย');
        cy.get('[data-cy="room-list-table-body"]').find('[data-cy^="room-list-cell-tenant-"]').first().click();
        cy.get('[data-cy="room-detail-tenant-name"]').should('contain', 'สมชาย');
        cy.get('[data-cy="room-detail-back-button"]').click();
    })

    it('sort test (desc)', () =>{
        cy.get('[data-cy="room-list-table-body"]').find('[data-cy^="room-list-cell-number-"]').first().should('contain', '1101');
    })
    it('sort test (asc)', () =>{
        cy.get('[data-cy="standard-table-header-sort-label-roomNumber"]').click();
        cy.get('[data-cy="room-list-table-body"]').find('[data-cy^="room-list-cell-number-"]').first().should('contain', '102');
    })

    // it('test create room test 601', ()=>{
    //     cy.get('[data-cy="home-nav-bar-add-button"]').click();
    //     cy.get('[data-cy="create-room-modal-number-input"]').type('701');
    //
    //     cy.get('[data-cy="create-room-modal-submit-button"]').click();
    //
    // })

    // it('test delete room test 601', () =>{
    //     cy.get('[data-cy="smart-search-input-field"]').type('701{enter}');
    //     cy.get('[data-cy="room-list-table-body"]').find('[data-cy^="room-list-cell-number-"]').first().should('contain', '701').click();
    //     cy.get('[data-cy="room-detail-title-room-number"]').should('be.visible');
    //     cy.get('[data-cy="room-detail-edit-room-button"]').click();
    //     cy.get('[data-cy="room-edit-modal-number-input"]').should('be.visible');
    //
    //     cy.get('[data-cy="room-edit-modal-delete-button"]').click();
    // })

});