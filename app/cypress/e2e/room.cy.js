import cy from "../../src/api/http";

beforeEach(() => {
    // Visits the root of the application
    cy.visit('/');
    cy.get('#root input[type="text"]').click();
    cy.get('#root input[type="text"]').type('admin');
    cy.get('#root input[type="password"]').type('password');
    cy.get('#root button[type="submit"]').click();
    cy.get('[data-testid="MenuIcon"]').click();
    cy.get('li:nth-child(2) div[tabindex="0"] div span').click();
    cy.get('[data-testid="AddIcon"]').click();
    cy.get('input[placeholder="เช่น 101"]').click();
    cy.get('input[placeholder="เช่น 101"]').type('101');
    cy.get('div:nth-child(3) > button:nth-child(2)').click();
    cy.get('[data-testid="MenuIcon"]').click();
    cy.get('ul:nth-child(3) li:nth-child(1) div[tabindex="0"] div span').click();
    cy.get('#root div.css-1yjvs5a > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)').should('exist');
    cy.get('#root h5').should('contain', 'ชั้น 1');
    cy.get('#root div:nth-child(2) > span').should('contain', '1');
    cy.get('#root div:nth-child(4) span').should('contain', '1');
    cy.get('#root div.css-0 p:nth-child(1)').click();
    // cy.get('#root div.css-1663ebo button').click();
    // cy.get('div:nth-child(3) button:nth-child(1)').click();
});

it('editRoom', function() {
    cy.get('#root div.css-1663ebo button').click();
    cy.get('input[step="1"]').click();
    cy.get('button:nth-child(3)').click();
    cy.get('#root div.css-1663ebo button').click();
    cy.get('body').click();
    cy.get('#menu- li[tabindex="-1"]').click();
    cy.get('button:nth-child(3)').click();
    // cy.get('#root h1').should('contain', 'ห้อง 102');
    cy.get('[data-testid="ArrowBackIcon"]').click();
    cy.get('#root div:nth-child(6) span').should('contain', '1');
    cy.get('#root div.css-1yjvs5a > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)').should('exist')
    cy.get('#root div.css-0 p:nth-child(1)').click();
    cy.get('#root div.css-1663ebo button').click();
    cy.get('div:nth-child(3) button:nth-child(1)').click();
});

it('deleteRoom', function() {
    cy.get('#root div.css-1663ebo button').click();
    cy.get('#root div.css-1663ebo button').click();
    cy.get('#root div.css-1663ebo button').click();
})