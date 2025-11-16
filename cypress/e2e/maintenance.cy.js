describe('Maintenance page test', () => {

    beforeEach(() => {
        cy.intercept('GET', '/api/maintenance**').as('getHistory');
        cy.visit('/');
        cy.get('[data-cy="login-username-input"]').type('Admin');
        cy.get('[data-cy="login-password-input"]').type('1234');
        cy.get('[data-cy="login-submit-button"]').click();
        cy.get('[data-cy="header-menu-button"]').click();
        cy.get('[data-cy="home-page-drawer-nav-item-1"]').click();

        cy.wait('@getHistory');
    });
    it('link to room detail', ()=>{
        cy.get('[data-cy="maintenance-history-room-link-button-300"]').click(); // cannot find element
        cy.get('[data-cy="room-detail-title-room-number"]').should('be.visible');
        cy.get('[data-cy="room-detail-back-button"]').click();
    });

    it('smart search to room detail', () =>{
        cy.get('[data-cy="smart-search-input-field"]').type('201');
        cy.get('li[data-option-index="0"]').should('contain', '201');
        cy.get('li[data-option-index="0"]').click();
        cy.get('[data-cy="maintenance-history-cell-ref-1"]').should('contain', '201');
        cy.get('[data-cy="maintenance-history-cell-ref-1"]').click();
        cy.get('[data-cy="room-detail-title-room-number"]').should('be.visible');
        cy.get('[data-cy="room-detail-back-button"]').click();
    })

    it('test create maintenance', ()=>{
        cy.get('[data-cy="home-nav-bar-add-button"]').click();
        cy.get('[data-cy="create-maintenance-room-number-input"]').type('301');
        cy.get('[data-cy="create-maintenance-date-input"]').click();
        cy.get('[data-cy="create-maintenance-description-input"]').click();
        cy.get('[data-cy="create-maintenance-description-input"]').type('Light bulb replacement');
        cy.get('[data-cy="create-maintenance-cost-input"]').click();
        cy.get('[data-cy="create-maintenance-cost-input"]').type('30');
        cy.get('[data-cy="maintenance-history-create-modal"]').click();
        cy.get('[data-cy="create-maintenance-room-number-input"]').click();

        cy.get('[data-cy="create-maintenance-modal-submit-button"]').click();
    })

    it('test cancel maintenance', ()=>{
        cy.get('[data-cy="maintenance-history-edit-button-303"]').click();
        cy.get('[data-cy="edit-maintenance-status-select"]').should('be.visible');
        cy.get('[data-cy="edit-maintenance-status-select"]').click();
        cy.get('[data-cy="edit-maintenance-status-option-canceled"]').click();
        cy.get('[data-cy="edit-maintenance-modal-save-button"]').click();
        cy.get('[data-cy="maintenance-history-status-chip-303"]').should('contain', 'CANCELED');
    })

    it('test in progress maintenance', ()=>{
        cy.get('[data-cy="maintenance-history-edit-button-303"]').click();
        cy.get('[data-cy="edit-maintenance-status-select"]').should('be.visible');
        cy.get('[data-cy="edit-maintenance-status-select"]').click();
        cy.get('[data-cy="edit-maintenance-status-option-in-progress"]').click();
        cy.get('[data-cy="edit-maintenance-modal-save-button"]').click();
        cy.get('[data-cy="maintenance-history-status-chip-303"]').should('contain', 'กำลังดำเนินการ');
    })

    it('test completed maintenance', ()=>{
        cy.get('[data-cy="maintenance-history-edit-button-303"]').click();
        cy.get('[data-cy="edit-maintenance-status-select"]').should('be.visible');
        cy.get('[data-cy="edit-maintenance-status-select"]').click();
        cy.get('[data-cy="edit-maintenance-status-option-completed"]').click();
        cy.get('[data-cy="edit-maintenance-modal-save-button"]').click();
        cy.get('[data-cy="maintenance-history-status-chip-303"]').should('contain', 'เสร็จสิ้น');
    })

    it('test change date', ()=>{
        cy.get('[data-cy="maintenance-history-edit-button-303"]').click();
        cy.get('[data-cy="edit-maintenance-date-input"]').click();
        cy.get('[data-cy="edit-maintenance-modal-save-button"]').click();
        cy.get('[data-cy="maintenance-history-cell-date-303"]').should('contain', '6/11/2025');
    })

    it('test change price', ()=>{
        cy.get('[data-cy="maintenance-history-edit-button-303"]').click();
        cy.get('[data-cy="edit-maintenance-cost-input"]').click();
        cy.get('[data-cy="edit-maintenance-cost-input"]').type('{selectall}{backspace}100');
        cy.get('[data-cy="edit-maintenance-modal-save-button"]').click();
        cy.get('[data-cy="maintenance-history-cell-cost-303"]').should('contain', '100');
    })

    it('test add staff', ()=>{
        cy.get('[data-cy="maintenance-history-edit-button-303"]').click();
        cy.get('[data-cy="edit-maintenance-responsible-person-input"]').type('{selectall}{backspace}ชนาธิป แซ่ตั้ง');
        cy.get('[data-cy="edit-maintenance-modal-save-button"]').click();
        cy.get('[data-cy="maintenance-history-cell-responsible-303"]').should('contain', 'ชนาธิป แซ่ตั้ง');
    })

    it('test add phone number', ()=>{
        cy.get('[data-cy="maintenance-history-edit-button-303"]').click();
        cy.get('[data-cy="edit-maintenance-responsible-phone-input"]').type('{selectall}{backspace}0000000000');
        cy.get('[data-cy="edit-maintenance-modal-save-button"]').click();
        cy.get('[data-cy="maintenance-history-cell-responsible-303"]').should('contain', '0000000000');
    })

    it('test add pictures', ()=>{
        cy.get('[data-cy="maintenance-history-edit-button-303"]').click();
        cy.get('[data-cy="doc-upload-select-file-button"]').selectFile('cypress/fixtures/Maintenance_test_pic.jpg');
        cy.get('[data-cy="doc-upload-list-container"]').should('not.be.empty');
        cy.get('[data-cy="doc-upload-list-container"]').find('[data-cy^="doc-upload-list-item-name-"]').last().should('contain', 'Maintenance_test_pic.jpg');
        cy.get('[data-cy="edit-maintenance-modal-save-button"]').click();
    })

    it('test download pictures', () => {
        cy.get('[data-cy="maintenance-history-edit-button-303"]').click();
        cy.get('[data-cy="doc-upload-list-container"]').should('not.be.empty');

        cy.intercept('GET', '/api/documents/*/download').as('fileDownload');

        cy.get('[data-cy="doc-upload-list-container"]')
            .find('[data-cy^="doc-upload-list-item-download-button-"]')
            .last()
            .click();

        cy.wait('@fileDownload').then((interception) => {
            expect(interception.response.statusCode).to.eq(302);

            const redirectUrl = interception.response.headers['location'];

            cy.request({
                url: redirectUrl,
                method: 'GET',
                encoding: 'binary'
            }).then((fileResponse) => {
                expect(fileResponse.status).to.eq(200);
                expect(fileResponse.body.length).to.be.greaterThan(0);
            });
        });

        cy.get('[data-cy="edit-maintenance-modal-save-button"]').click();
    });

    it('test upload a picture using drag-and-drop', () => {
        cy.get('[data-cy="maintenance-history-edit-button-303"]').click();
        cy.get('[data-cy="doc-upload-dropzone"]')
            .selectFile('cypress/fixtures/Maintenance_test_pic.jpg', {
                action: 'drag-drop'
            });

        cy.get('[data-cy="doc-upload-list-container"]').find('[data-cy^="doc-upload-list-item-name-"]').last().should('contain', 'Maintenance_test_pic.jpg');
    });

    it('test delete pictures', ()=>{
        cy.get('[data-cy="maintenance-history-edit-button-303"]').click();
        cy.get('[data-cy="doc-upload-list-container"]').should('not.be.empty');

        cy.get('[data-cy="doc-upload-list-container"]').find('[data-cy^="doc-upload-list-item-delete-button-"]').last().click()
        cy.get('[data-cy="edit-maintenance-modal-save-button"]').click();
    })

    it('should delete all uploaded files until the list is empty', () => {
        cy.get('[data-cy="maintenance-history-edit-button-303"]').click();

        // Upload file
        cy.get('[data-cy="doc-upload-select-file-button"]').selectFile('cypress/fixtures/Maintenance_test_pic.jpg');
        cy.get('[data-cy^="doc-upload-list-item-delete-button-"]').should('be.visible');

        function deleteAllFiles() {
            cy.get('body').then($body => {
                if ($body.find('[data-cy^="doc-upload-list-item-delete-button-"]').length > 0) {
                    cy.get('[data-cy^="doc-upload-list-item-delete-button-"]').first().click();
                    cy.wait(500);
                    deleteAllFiles(); // Recursion
                }
            });
        }

        deleteAllFiles();

        cy.get('[data-cy="doc-upload-no-documents-message"]').should('be.visible');
    });
});