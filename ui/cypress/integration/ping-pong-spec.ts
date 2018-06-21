const appPackage = require('../../package.json');

describe('The Ping Pong Pulse', () => {

  beforeEach(() => {
    cy.server();
    cy.route('/api/stats*', 'fixture:stats').as('getStats');
    cy.visit('/');
  });

  it('successfully loads', () => {
    cy.get('.title').should('contain', 'Ping Png pulse');
  });

  it('test playing event', () => {
    cy.get('app-status').should('contain', 'Game in progress…');
  });

  it('test app version', () => {
    cy.get('.version').should('contain', appPackage.version);
  });

  it('test time line', () => {
    cy.get('app-timeline').click(10, 100);
    cy.get('app-status').should('contain', 'Game in progress…');
    cy.get('app-status button').should('contain', 'Back');
    cy.get('app-timeline .reset-button').should('be.visible');

    cy.get('app-status button').click();
    cy.get('app-status button').should('not.exist');
  });
});
