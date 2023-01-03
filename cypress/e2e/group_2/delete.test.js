import { SuggestionSelectOptions } from '../../constants';

describe.skip('Delete', () => {
  before(() => {
    cy.seedDatabase();
    cy.cleanLogin();
  });

  it('delete a wordSuggestion in list view', () => {
    cy.createWordSuggestion();
    cy.selectCollection('wordSuggestions');
    cy.getWordSuggestionDocumentDetails();
    cy.getActionsOption(SuggestionSelectOptions.DELETE).click();
    cy.acceptConfirmation();
    cy.get('@selectedId').should('not.exist');
  });

  it('delete a wordSuggestion in show view', () => {
    cy.createWordSuggestion();
    cy.selectCollection('wordSuggestions');
    cy.getWordSuggestionDocumentDetails();
    cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
    cy.getActionsOption(SuggestionSelectOptions.DELETE).click();
    cy.acceptConfirmation();
    cy.get('@selectedId').should('not.exist');
  });

  it('delete an exampleSuggestion in list view', () => {
    cy.createExampleSuggestion();
    cy.selectCollection('exampleSuggestions');
    cy.getExampleSuggestionDocumentDetails();
    cy.getActionsOption(SuggestionSelectOptions.DELETE).click();
    cy.acceptConfirmation();
    cy.get('@selectedId').should('not.exist');
  });

  it('delete an exampleSuggestion in show view', () => {
    cy.createExampleSuggestion();
    cy.selectCollection('exampleSuggestions');
    cy.getExampleSuggestionDocumentDetails();
    cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
    cy.getActionsOption(SuggestionSelectOptions.DELETE).click();
    cy.acceptConfirmation();
    cy.get('@selectedId').should('not.exist');
  });
});
