/// <reference types='cypress' />
require('cypress-plugin-api');

describe('Contact List App', () => {
    before(() => {
        cy.addUser().then(response => {
            cy.wrap(response.body.token).as('token');
            cy.wrap(response.body.user.email).as('email');

            expect(response.status).is.eq(201);
            expect(response.statusText).is.eq('Created');
        });
    });

    context('Users - API tests', () => {
        it('POST - Log In User', function () {
            cy.logInUser(this.email).then(response => {
                expect(response.status).is.eq(200);
                expect(response.statusText).is.eq('OK');
                expect(response.body.user).to.have.property('_id');
                expect(response.requestHeaders['content-type']).is.eq('application/json');
                expect(response.requestHeaders.cookie).is.eq(`token=${this.token}`);
            });
        });

        it('GET - Get User Profile', function () {
            cy.api({
                method: 'GET',
                url: '/users/me',
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }).then(response => {
                expect(response.status).is.eq(200);
                expect(response.statusText).is.eq('OK');
                expect(response.body).to.have.all.keys('_id', 'firstName', 'lastName', 'email', '__v');
                expect(response.body.email).is.eq(this.email);
            });
        });

        it('PATCH - Update User', function () {
            const updatedUser = {
                "firstName": "NewFirst",
                "lastName": "NewLast",
                "email": "newemail@test.com",
                "password": "NewPassword"
            }

            cy.api({
                method: 'PATCH',
                url: '/users/me',
                headers: {
                    Authorization: `Bearer ${this.token}`
                },
                body: updatedUser
            }).then(response => {
                expect(response.status).is.eq(200);
                expect(response.statusText).is.eq('OK');
                expect(response.body).to.have.all.keys('_id', 'firstName', 'lastName', 'email', '__v');
                expect(response.body.email).is.eq(updatedUser.email);
                expect(response.body.firstName).is.eq(updatedUser.firstName);
                expect(response.body.lastName).is.eq(updatedUser.lastName);
            });
        });

        it('DELETE - Delete User', function () {
            cy.api({
                method: 'DELETE',
                url: '/users/me',
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            })
        });

        it('POST - Log Out User', function () {
            cy.addUser().then(response => {
                cy.wrap(response.body.user.email).as('email');
                cy.wrap(response.body.token).as('token');

                expect(response.status).is.eq(201);
                expect(response.statusText).is.eq('Created');
            });

            cy.get('@email').then(email => {
                cy.logInUser(email).then(response => {
                    expect(response.status).is.eq(200);
                });
            });

            cy.get('@token').then(token => {
                cy.api({
                    method: 'POST',
                    url: '/users/logout',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    expect(response.status).is.eq(200);
                    expect(response.statusText).is.eq('OK');
                });
            });
        });
    });

    context('Contacts - API and UI tests', () => {
        it('test', function () {
            //TODO
        });
    });
});