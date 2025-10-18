it('invoiceInRoom', function () {
    cy.visit('/')
    cy.get('#root input[type="text"]').click();
    cy.get('#root input[type="text"]').type('admin');
    cy.get('#root input[type="password"]').type('password');
    cy.get('#root button[type="submit"]').click();
    cy.get('#root div.css-1yjvs5a > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)').click();
    cy.get('#root div.css-irrfx6 button').click();
    cy.get('input[min="1900"]').click();
    cy.get('input[min="1"]').click();
    cy.get('input[value="2025-10-18"]').click();
    cy.get('input[value="2025-10-25"]').click();
    cy.get('div:nth-child(6) div:nth-child(1) div:nth-child(1) div input').click();
    cy.get('div:nth-child(6) div:nth-child(1) div:nth-child(1) div input').type('3');
    cy.get('div:nth-child(6) div:nth-child(2) div:nth-child(1) div input').click();
    cy.get('div:nth-child(6) div:nth-child(2) div:nth-child(1) div input').type('3');
    cy.get('div:nth-child(8) div:nth-child(1) div:nth-child(1) div input').click();
    cy.get('div:nth-child(8) div:nth-child(1) div:nth-child(1) div input').type('3');
    cy.get('div:nth-child(8) div:nth-child(2) div:nth-child(1) div input').click();
    cy.get('div:nth-child(8) div:nth-child(2) div:nth-child(1) div input').type('3');
    cy.get('div:nth-child(9) input[value]').click();
    cy.get('div:nth-child(9) input[value]').type('3');
    cy.get('div:nth-child(3) > button:nth-child(2)').click();
    
})

it('invoiceCreate', function() {
    cy.visit('/')
    cy.get('#root input[type="text"]').click();
    cy.get('#root input[type="text"]').type('admin');
    cy.get('#root input[type="password"]').type('password{enter}');
    cy.get('#root button[type="submit"]').click();
    cy.get('#root button[aria-label="open drawer"]').click();
    cy.get('li:nth-child(3) div[tabindex="0"] div span').click();
    cy.get('#root div.css-j0ozid button').click();
    cy.get('div[role="dialog"] > div:nth-child(2)').click();
    cy.get('input[min="1900"]').click();
    cy.get('input[min="1"]').click();
    cy.get('input[value="2025-10-17"]').click();
    cy.get('input[value="2025-10-24"]').click();
    cy.get('div:nth-child(7) div:nth-child(1) div:nth-child(1) div input').click();
    cy.get('div[tabindex="-1"]').click();
    cy.get('div:nth-child(3) > button:nth-child(2)').click();
    
});