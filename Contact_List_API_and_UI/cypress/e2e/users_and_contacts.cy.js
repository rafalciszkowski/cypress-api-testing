/// <reference types='cypress' />
require('cypress-plugin-api');

describe('Contact List App', () => {

    context('Users - API tests', () => {
        before(() => {
            cy.addUser().then(response => {
                cy.wrap(response.body.token).as('token');
                cy.wrap(response.body.user.email).as('email');

                expect(response.status).is.eq(201);
                expect(response.statusText).is.eq('Created');
            });
        });

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
                "firstName": "1NewFirst",
                "lastName": "1NewLast",
                "email": "1newemail@test.com",
                "password": "1NewPassword"
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
        before(function () {
            cy.addUser().then(({ body }) => {
                cy.wrap(body.user.email).as('email');
                cy.wrap(body.token).as('token');
            });
        });

        beforeEach(function () {
            cy.setCookie('token', this.token);
        });

        it('POST - Add Contact', function () {
            cy.addContact(this.token).then(({ status, statusText, body }) => {
                expect(status).is.eq(201);
                expect(statusText).is.eq('Created');
                expect(body).to.have.property('_id');
                expect(body).to.have.property('owner');
                expect(body.email).is.eq('roman@doman.com');
                expect(body.lastName).is.eq('Doman');
                expect(body.firstName).is.eq('Roman');

                cy.wrap(body.email).as('responseEmail');
                cy.wrap(body.firstName).as('responseFirstName');
                cy.wrap(body.lastName).as('responseLastName');
            });

            cy.visit('/contactList/');

            cy.get('#myTable').should('exist');
            cy.get('#myTable > thead > tr > th').then((headers) => {
                headers.each((index, $el) => {
                    cy.wrap($el).invoke('text').then((text) => {
                        expect(text).to.be.oneOf(['Name', 'Birthdate', 'Email', 'Phone', 'Address', 'City, State/Province, Postal Code', 'Country']);
                    });
                });
            });

            cy.get('.contactTableBodyRow > :nth-child(4)').last().invoke('text').then(text => {
                expect(text).is.eq(this.responseEmail);
            });

            cy.get('.contactTableBodyRow > :nth-child(2)').last().invoke('text').then(text => {
                expect(text).is.eq(`${this.responseFirstName} ${this.responseLastName}`);
            });
        });

        it('GET - Get Contact List', function () {
            cy.api({
                method: 'GET',
                url: '/contacts/',
                headers: {
                    Authorization: this.token
                }
            }).then(({ status, statusText, body }) => {
                expect(status).is.eq(200);
                expect(statusText).is.eq('OK');
                expect(body.length).to.be.gt(0);
                expect(body[0]).to.have.all.keys(
                    '_id', 'firstName', 'lastName', 'birthdate', 'email', 'phone', 'street1', 'street2', 'city', 'stateProvince', 'postalCode', 'country', 'owner', '__v'
                );
            });
        });

        it('GET - Get Contact', function () {
            cy.api({
                method: 'GET',
                url: '/contacts/',
                headers: {
                    Authorization: this.token
                }
            }).then(({ body, status }) => {
                expect(status).is.eq(200);
                expect(body[0].email).is.eq('roman@doman.com');
                expect(body[0].lastName).is.eq('Doman');
                expect(body[0].firstName).is.eq('Roman');
            });
        });

        //This test case is skipped due to an API error (no response - also confirmed in Postman)
        it.skip('PUT - Update Contact', function () {
            const updatedBody = {
                "firstName": "Olek",
                "lastName": "Bolek",
                "birthdate": "1982-02-02",
                "email": "olek@bolek.com",
                "phone": "1212121212",
                "street1": "22 Gain av.",
                "street2": "Apartment X",
                "city": "Village",
                "stateProvince": "QC",
                "postalCode": "12345",
                "country": "USA"
            }

            cy.api({
                method: 'PUT',
                url: '/contacts/',
                body: updatedBody,
                headers: {
                    Authorization: this.token
                }
            });

            cy.visit('/contactList/');

            cy.get('.contactTableBodyRow > :nth-child(4)').last().invoke('text').then(text => {
                expect(text).is.eq(updatedBody.email);
            });

            cy.get('.contactTableBodyRow > :nth-child(2)').last().invoke('text').then(text => {
                expect(text).is.eq(`${updatedBody.firstName} ${updatedBody.lastName}`);
            });
        });

        //This test case is skipped due to an API error (no response - also confirmed in Postman)
        it.skip('PATCH - Update Contact', function () {
            const updatedBody = {
                "firstName": "Zula",
                "lastName": "Badula"
            }

            cy.api({
                method: 'PATCH',
                url: '/contacts/',
                body: updatedBody,
                headers: {
                    Authorization: this.token
                }
            });

            cy.visit('/contactList/');

            cy.get('.contactTableBodyRow > :nth-child(2)').last().invoke('text').then(text => {
                expect(text).is.eq(`${updatedBody.firstName} ${updatedBody.lastName}`);
            });
        });
    });
});