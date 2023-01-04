import { SuggestionSelectOptions } from '../../constants';

describe('Approve and Deny', () => {
  before(() => {
    cy.cleanLogin();
  });

  describe('Word Suggestions', () => {

    it.only('approve a wordSuggestion in list view', { scrollBehavior: false }, () => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getWordSuggestionDocumentDetails();
      cy.getActionsOption(SuggestionSelectOptions.APPROVE).click();
      cy.get('@selectedApprovals').then(($approvals) => {
        const approvalsCount = parseInt($approvals.text(), 10);
        expect(typeof approvalsCount).to.equal('number');
        cy.acceptConfirmation();
        cy.get('@selectedApprovals').should('not.contain', 0);
      });
    });

    it('deny a wordSuggestion in list view', { scrollBehavior: false }, () => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getWordSuggestionDocumentDetails();
      cy.getActionsOption(SuggestionSelectOptions.DENY).click();
      cy.get('@selectedDenials').then(($denials) => {
        const denialsCount = parseInt($denials.text(), 10);
        expect(typeof denialsCount).to.equal('number');
        cy.acceptConfirmation();
        cy.get('@selectedDenials').should('not.contain', 0);
      });
    });

    it('approve a wordSuggestion in show view', { scrollBehavior: false }, () => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getWordSuggestionDocumentDetails();
      cy.get('@selectedApprovals').then(($approvals) => {
        cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
        cy.getActionsOption(SuggestionSelectOptions.APPROVE).click();
        const approvalsCount = parseInt($approvals.text(), 10);
        expect(typeof approvalsCount).to.equal('number');
        cy.acceptConfirmation();
        cy.get('@selectedApprovals').should('not.contain', approvalsCount);
      });
    });

    it('deny a wordSuggestion in show view', { scrollBehavior: false }, () => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getWordSuggestionDocumentDetails();
      cy.get('@selectedDenials').then(($denials) => {
        cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
        cy.getActionsOption(SuggestionSelectOptions.DENY).click();
        const denialsCount = parseInt($denials.text(), 10);
        expect(typeof denialsCount).to.equal('number');
        cy.acceptConfirmation();
        cy.get('@selectedDenials').should('not.contain', 0);
      });
    });
  });

  describe('Example Suggestions', () => {
    it('approve a exampleSuggestion in list view', { scrollBehavior: false }, () => {
      cy.createExampleSuggestion();
      cy.selectCollection('exampleSuggestions');
      cy.getExampleSuggestionDocumentDetails();
      cy.getActionsOption(SuggestionSelectOptions.APPROVE).click();
      cy.get('@selectedApprovals').then(($approvals) => {
        const approvalsCount = parseInt($approvals.text(), 10);
        expect(typeof approvalsCount).to.equal('number');
        cy.acceptConfirmation();
        cy.get('@selectedApprovals').should('not.contain', 0);
      });
    });

    it('deny a exampleSuggestion in list view', { scrollBehavior: false }, () => {
      cy.createExampleSuggestion();
      cy.selectCollection('exampleSuggestions');
      cy.getExampleSuggestionDocumentDetails();
      cy.getActionsOption(SuggestionSelectOptions.DENY).click();
      cy.get('@selectedDenials').then(($denials) => {
        const denialsCount = parseInt($denials.text(), 10);
        expect(typeof denialsCount).to.equal('number');
        cy.acceptConfirmation();
        cy.get('@selectedDenials').should('not.contain', 0);
      });
    });

    it('approve a exampleSuggestion in show view', { scrollBehavior: false }, () => {
      cy.createExampleSuggestion();
      cy.selectCollection('exampleSuggestions');
      cy.getExampleSuggestionDocumentDetails();
      cy.get('@selectedApprovals').then(($approvals) => {
        cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
        cy.getActionsOption(SuggestionSelectOptions.APPROVE).click();
        const approvalsCount = parseInt($approvals.text(), 10);
        expect(typeof approvalsCount).to.equal('number');
        cy.acceptConfirmation();
        cy.get('@selectedApprovals').should('not.contain', 0);
      });
    });

    it('deny a exampleSuggestion in show view', { scrollBehavior: false }, () => {
      cy.createExampleSuggestion();
      cy.selectCollection('exampleSuggestions');
      cy.getExampleSuggestionDocumentDetails();
      cy.get('@selectedDenials').then(($denials) => {
        cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
        cy.getActionsOption(SuggestionSelectOptions.DENY).click();
        const denialsCount = parseInt($denials.text(), 10);
        expect(typeof denialsCount).to.equal('number');
        cy.acceptConfirmation();
        cy.get('@selectedDenials').should('not.contain', 0);
      });
    });
  });
});
