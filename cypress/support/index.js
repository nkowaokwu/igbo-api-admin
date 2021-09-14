import { configure } from '@testing-library/cypress';
import './commands';

configure({ testIdAttribute: 'data-test' });

Cypress.on('uncaught:exception', (err) => {
  console.log(err.message);
  console.log(err.stack);
  return false;
});

beforeEach(() => {
  cy.wrap(false).as('skipErrorMessageCheck');
  cy.restoreLocalStorage();
  cy.wait(1000);
});

afterEach(() => {
  cy.saveLocalStorage();
  cy.get('@skipErrorMessageCheck').then((res) => {
    if (!res) {
      cy.checkForErrorMessage();
    }
    cy.wrap(false).as('skipErrorMessageCheck');
  });
});
