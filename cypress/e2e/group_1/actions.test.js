import { DocumentSelectOptions, SuggestionSelectOptions } from '../../constants';

describe('Actions', () => {
  before(() => {
    cy.cleanLogin();
  });

  describe('Merge', () => {
    it('show merge word suggestion', () => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getWordSuggestionDocumentDetails();
      cy.get('@selectedWord').then(([$word]) => {
        cy.getActionsOption(SuggestionSelectOptions.MERGE).click({ scrollBehavior: false });
        cy.acceptConfirmation();
        cy.findByText('View the updated document here').click();
        cy.findByText('Word Document Details');
        cy.findAllByText($word.innerText).first();
      });
    });

    it('show disabled merge for example suggestion', () => {
      cy.createExampleSuggestion();
      cy.selectCollection('exampleSuggestions');
      cy.getExampleSuggestionDocumentDetails();
      cy.get('@selectedIgbo').then(([$igbo]) => {
        cy.getActionsOption(SuggestionSelectOptions.MERGE).click({ scrollBehavior: false });
        cy.acceptConfirmation();
        cy.findByText('View the updated document here').click();
        cy.findByText('Example Document Details');
        cy.findAllByText($igbo.innerText).first();
      });
    });
  });

  describe('Combine', () => {
    it('combine one word into another word', { scrollBehavior: false }, () => {
      cy.selectCollection('words');
      cy.getWordDetails(2);
      cy.getActionsOption(DocumentSelectOptions.COMBINE_WORD_INTO).click({ scrollBehavior: false });
      cy.get('@selectedId').then(([id]) => {
        cy.findByTestId('primary-word-id-input').type(id.innerText);
        cy.acceptConfirmation();
      });
    });

    it('throw an error when no primary word id is provided', { scrollBehavior: false }, () => {
      cy.selectCollection('words');
      cy.getActionsOption(DocumentSelectOptions.COMBINE_WORD_INTO).click({ scrollBehavior: false });
      cy.acceptConfirmation();
      cy.wrap(true).as('skipErrorMessageCheck');
      cy.get('div').contains(/^Error:/, { timeout: 1000 });
    });
  });
});
