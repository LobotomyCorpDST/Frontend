// it('maintainCreate', () => {
//     cy.visit('/')
//     cy.get('#root input[type="text"]').click();
//     cy.get('#root input[type="text"]').type('admin');
//     cy.get('#root input[type="password"]').type('password');
//     cy.get('#root button[type="submit"]').click();
//     cy.get('#root button[tabindex="0"]').click();
//     cy.get('li:nth-child(4) div[tabindex="0"] div span').click();
//     cy.get('#root div.css-j0ozid button').click();
//     cy.get('div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > input').click();
//     cy.get('div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > input').type('101');
//     cy.get('input[type="date"]').click();
//     cy.get('textarea[aria-invalid="false"]').click();
//     cy.get('textarea[aria-invalid="false"]').type('aaaaaaa');
//     cy.get('input[step="0.01"]').type('100');
//     cy.get('div:nth-child(3) > button:nth-child(2)').click();
//
// });

it('maintainFromRoom', () => {
    cy.visit('/')
    cy.get('#root input[type="text"]').click();
    cy.get('#root input[type="text"]').type('admin');
    cy.get('#root input[type="password"]').type('password');
    cy.get('#root button[type="submit"]').click();
    cy.get('#root div.css-0 p:nth-child(1)').click();
    cy.get('#root button[tabindex="-1"]').click();
    cy.get('#root div.css-irrfx6 button').click();
    cy.get('input[type="date"]').click();
    cy.get('textarea[aria-invalid="false"]').click();
    cy.get('textarea[aria-invalid="false"]').type('bbbbbb');
    cy.get('input[step="0.01"]').click();
    cy.get('input[step="0.01"]').type('5');
    cy.get('div:nth-child(3) button:nth-child(2)').click();
    
});

it('maintainMarkDone', () => {
    cy.visit('/')
    cy.get('#root input[type="text"]').click();
    cy.get('#root input[type="text"]').type('admin');
    cy.get('#root input[type="password"]').type('password');
    cy.get('#root button[type="submit"]').click();
    cy.get('#root div.css-0 p:nth-child(1)').click();
    cy.get('#root button[tabindex="-1"]').click();
    cy.get('#root tr:nth-child(1) button:nth-child(1)').click();
    
})