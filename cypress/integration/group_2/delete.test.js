import { SuggestionSelectOptions } from '../../constants';

describe('Delete', () => {
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

  it.skip('delete a genericWord in list view', () => {
    cy.selectCollection('genericWords');
    cy.getWordSuggestionDocumentDetails();
    cy.getActionsOption(SuggestionSelectOptions.DELETE).click();
    cy.acceptConfirmation();
    cy.get('@selectedId').should('not.exist');
  });

  it.skip('delete a genericWord in show view', () => {
    cy.selectCollection('genericWords');
    cy.getWordSuggestionDocumentDetails();
    cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
    cy.getActionsOption(SuggestionSelectOptions.DELETE).click();
    cy.acceptConfirmation();
    cy.get('@selectedId').should('not.exist');
  });

  it.skip('bulk delete all genericWords as merger', () => {
    cy.selectCollection('genericWords');
    cy.getWordSuggestionDocumentDetails();
    cy.get('input[type="checkbox"]').first().click();
    cy.findByText('Delete').click();
    cy.get('html').click('bottomLeft');
    cy.getWordSuggestionDocumentDetails();
  });

  // DEPRECATED: Test is skipped because generic words are not visible to non-admins
  it.skip('unable to bulk delete all genericWords as editor', () => {
    cy.cleanLogin('test@example.com', { role: 'editor', editingGroup: 1 });
    cy.selectCollection('genericWords');
    cy.get('input[type="checkbox"]').should('not.exist');
    cy.getWordSuggestionDocumentDetails();
  });
});
