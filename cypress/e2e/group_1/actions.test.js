import { DocumentSelectOptions, SuggestionSelectOptions } from '../../constants';

describe('Actions', () => {
  before(() => {
    cy.seedDatabase();
    cy.cleanLogin();
  });

  describe('Merge', () => {
    it('show disabled merge for word suggestion', () => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getWordSuggestionDocumentDetails();
      cy.get('@selectedWord').then(([]) => {
        cy.getActionsOption(SuggestionSelectOptions.MERGE).should('be.disabled');
      });
    });

    it('show disabled merge for example suggestion', () => {
      cy.createExampleSuggestion();
      cy.selectCollection('exampleSuggestions');
      cy.getExampleSuggestionDocumentDetails();
      cy.get('@selectedIgbo').then(([$igbo]) => {
        cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
        cy.acceptConfirmation();
        cy.findByText('View the updated document here').click();
        cy.findByText('Example Document Details');
        cy.findAllByText($igbo.innerText).first();
      });
    });
  });

  describe.skip('Combine', () => {
    it('combine one word into another word', { scrollBehavior: false }, () => {
      cy.selectCollection('words');
      cy.searchForDocument('');
      cy.getWordDetails(2);
      cy.getActionsOption(DocumentSelectOptions.COMBINE_WORD_INTO).click();
      cy.get('@selectedId').then(([id]) => {
        cy.findByTestId('primary-word-id-input').type(id.innerText);
        cy.acceptConfirmation();
      });
    });

    it('throw an error when no primary word id is provided', { scrollBehavior: false }, () => {
      cy.selectCollection('words');
      cy.searchForDocument('');
      cy.getActionsOption(DocumentSelectOptions.COMBINE_WORD_INTO).click();
      cy.acceptConfirmation();
      cy.wrap(true).as('skipErrorMessageCheck');
      cy.get('div').contains(/^Error:/, { timeout: 1000 });
    });
  });
});
