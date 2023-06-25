/// <reference types='cypress' />
require('cypress-plugin-api');

describe('Booking API - test all methods', () => {
    const bookingObjectOrigin = {
        "firstname": "Roman",
        "lastname": "Doman",
        "totalprice": 200,
        "depositpaid": true,
        "bookingdates": {
            "checkin": "2023-01-01",
            "checkout": "2023-02-02"
        },
        "additionalneeds": "Breakfast"
    }

    const bookingObjectUpdated = {
        "firstname": "Jacek",
        "lastname": "Placek",
        "totalprice": 333,
        "depositpaid": true,
        "bookingdates": {
            "checkin": "2023-01-01",
            "checkout": "2023-02-02"
        },
        "additionalneeds": "Netflix"
    }

    before(() => {
        cy.api({
            method: 'POST',
            url: '/auth',
            body: {
                username: 'admin',
                password: 'password123'
            }
        }).then((response) => {
            expect(response.status).is.eq(200);

            cy.wrap(response.body.token).as('token');
        });
    });

    it('GET - get all bookings', () => {
        cy.api('/booking').then((response) => {
            expect(response.status).is.eq(200);
            expect(response.statusText).is.eq('OK');
            expect(response.body.length).to.be.greaterThan(0);
            expect(response.body[0]).to.have.property('bookingid')
            expect(response.body[0].bookingid).to.be.a('number');
        });
    });

    it('POST - create new booking', () => {
        cy.api({
            method: 'POST',
            url: '/booking',
            body: bookingObjectOrigin
        }).then((response) => {
            expect(response.status).is.eq(200);
            expect(response.statusText).is.eq('OK');
            expect(response.body).to.have.property('bookingid');
            expect(response.body).to.have.property('booking');
            expect(response.body.bookingid).to.be.a('number');
            expect(response.body.booking).to.be.an('object');
            expect(response.body.booking).to.deep.eq(bookingObjectOrigin);

            cy.wrap(response.body.bookingid).as('bookingId');
        });
    });

    it('GET - get a specific booking', function () {
        cy.api({
            method: 'GET',
            url: `/booking/${this.bookingId}`
        }).then((response) => {
            expect(response.status).is.eq(200);
            expect(response.statusText).is.eq('OK');
            expect(response.body).to.deep.eq(bookingObjectOrigin);
        });
    });

    it('PUT - update specific booking', function () {
        cy.api({
            method: 'PUT',
            url: `/booking/${this.bookingId}`,
            headers: {
                Cookie: `token=${this.token}`
            },
            body: bookingObjectUpdated
        }).then((response) => {
            expect(response.status).is.eq(200);
            expect(response.statusText).is.eq('OK');
            expect(response.body).to.deep.eq(bookingObjectUpdated);
        });
    });

    it('PATCH - update specific field in specific booking', function () {
        const updatedName = {
            "firstname": "Robert"
        }

        cy.api({
            method: 'PATCH',
            url: `/booking/${this.bookingId}`,
            headers: {
                Cookie: `token=${this.token}`
            },
            body: updatedName
        }).then((response) => {
            expect(response.status).is.eq(200);
            expect(response.statusText).is.eq('OK');
            expect(response.body.firstname).is.eq(updatedName.firstname);
        });
    });

    it('DELETE - delete specific booking', function () {
        cy.api({
            method: 'DELETE',
            url: `/booking/${this.bookingId}`,
            headers: {
                Cookie: `token=${this.token}`
            }
        }).then((response) => {
            expect(response.status).is.eq(201);
            expect(response.statusText).is.eq('Created');
        });
    });
});