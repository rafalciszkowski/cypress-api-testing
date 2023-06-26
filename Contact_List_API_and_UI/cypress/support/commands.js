// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('addUser', () => {
    cy.api({
        method: 'POST',
        url: '/users',
        body: {
            "firstName": "Roman",
            "lastName": "Doman",
            "email": `${Math.random().toString(36).slice(2)}@test.com`,
            "password": "testApi12"
        }
    });
});

Cypress.Commands.add('logInUser', (email) => {
    cy.api({
        method: 'POST',
        url: '/users/login',
        body: {
            "email": email,
            "password": "testApi12"
        }
    });
});