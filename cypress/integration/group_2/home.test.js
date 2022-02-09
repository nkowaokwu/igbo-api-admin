import { forEach, values, times } from 'lodash';
import { DocumentSelectOptions, SuggestionSelectOptions, UserSelectOptions } from '../../constants';

describe('Editor platform', () => {
  beforeEach(() => {
    cy.cleanLogin();
  });
  describe('Signup Page', () => {
    it('signs up with all the required inforamtion', () => {
      cy.logout();
      cy.visit('/');
      cy.intercept('signupNewUser**', { data: 'stubbed' });
      cy.intercept('createUserAccount**', { code: 200 });
      cy.intercept('getAccountInfo**', { code: 200 });
      cy.visit('http://localhost:3030/#/login');
      cy.contains('Sign in with email').click();
      cy.get('input[type="email"]').clear().type('newaccount@example.com');
      cy.findByRole('button', { name: 'Next' }).click();
      cy.get('#ui-sign-in-name-input').click().type('First Last');
      cy.get('input[type="password"]').clear().type('password');
    });
  });

  describe('Admin permissions', () => {
    it('user collection exists', () => {
      cy.cleanLogin();
      cy.get('a[href="#/users"]').click();
    });

    it('change editingGroup for an editor', () => {
      cy.cleanLogin();
      cy.get('a[href="#/users"]').click();
      cy.getActionsOption(UserSelectOptions.ASSIGN_EDITING_GROUP).click();
      cy.findByTestId('editing-group-number-input').type('2');
      cy.acceptConfirmation();
      cy.getUserDocumentDetails();
      cy.wait(2000);
      cy.findByRole('button', { name: 'Refresh' }).click();
      cy.get('@selectedEditingGroup').then(([$editingGroup]) => {
        expect($editingGroup.innerText).to.equal('2');
      });
    });

    it('bulk actions do render', () => {
      cy.visit('/');
      cy.cleanLogin();
      cy.selectCollection('wordSuggestions');
      cy.get('input[type="checkbox"]').should('exist');
    });

    // DEPRECATED: Test is skipped because generic words are not visible to non-admins
    it.skip('change editingGroup for an editor and then see different segment', () => {
      cy.cleanLogin();
      cy.get('a[href="#/users"]').click();
      cy.getActionsOption(UserSelectOptions.ASSIGN_EDITING_GROUP).click();
      cy.findByTestId('editing-group-number-input').type('3');
      cy.acceptConfirmation();
      cy.logout();
      cy.wait(2000);
      cy.cleanLogin('dummy3@example.com', 'password');
      cy.get('a[href="#/genericWords').click();
      cy.getWordSuggestionDocumentDetails();
      cy.get('@selectedId').then(([$thirdSegmentId]) => {
        cy.logout();
        cy.wait(2000); // Wait for localStorage to get cleared out
        cy.cleanLogin();
        cy.get('a[href="#/users"]').click();
        cy.getActionsOption(UserSelectOptions.ASSIGN_EDITING_GROUP).click();
        cy.findByTestId('editing-group-number-input').type('2');
        cy.acceptConfirmation();
        cy.wait(4000); // Wait for editingGroup number to update
        cy.logout();
        cy.wait(2000);
        cy.cleanLogin('dummy3@example.com', 'password');
        cy.get('a[href="#/genericWords').click();
        cy.visit(`#/genericWords/${$thirdSegmentId.innerText}/show`);
        cy.hash().should('eq', '#/genericWords');
        cy.wrap(true).as('skipErrorMessageCheck');
      });
    });
  });

  describe('Merger Permissions', () => {
    before(() => {
      cy.cleanLogin('merger@example.com', { role: 'merger' });
    });

    it('user collection doesn\'t exist', () => {
      cy.get('a[href="#/words"]');
      cy.get('a[href="#/users"]').should('not.exist');
    });

    it('render all merger actions in the list view for words', () => {
      cy.cleanLogin('merger@example.com', { role: 'merger' });
      cy.selectCollection('words');
      cy.getActionsOption(DocumentSelectOptions.COMBINE_WORD_INTO);
    });

    it('render all merger actions in the show view for words', () => {
      cy.selectCollection('words');
      cy.getActionsOption(DocumentSelectOptions.VIEW).click();
    });

    it('render all merger actions in list view for wordSuggestions', () => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.MERGE);
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.DELETE);
    });

    it('render all merger actions in show view for wordSuggestions', () => {
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.getActionsOption(SuggestionSelectOptions.MERGE);
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.getActionsOption(SuggestionSelectOptions.DELETE);
    });

    it('render all merger actions in list view for exampleSuggestions', () => {
      cy.createExampleSuggestion();
      cy.selectCollection('exampleSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.MERGE);
      cy.selectCollection('exampleSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.DELETE);
    });

    it('render all merger actions in show view for exampleSuggestions', () => {
      cy.selectCollection('exampleSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.getActionsOption(SuggestionSelectOptions.MERGE);
      cy.selectCollection('exampleSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.getActionsOption(SuggestionSelectOptions.DELETE);
    });

    it('bulk actions do render', () => {
      cy.selectCollection('wordSuggestions');
      cy.get('input[type="checkbox"]').should('exist');
    });

    // DEPRECATED: Test is skipped because generic words are not visible to non-admins
    it.skip('render all merger actions in list view for genericWords', () => {
      cy.createWordSuggestion();
      cy.selectCollection('genericWords');
      cy.getActionsOption(SuggestionSelectOptions.MERGE);
      cy.selectCollection('genericWords');
      cy.getActionsOption(SuggestionSelectOptions.DELETE);
    });

    // DEPRECATED: Test is skipped because generic words are not visible to non-admins
    it.skip('render all merger actions in show view for genericWords', () => {
      cy.selectCollection('genericWords');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.getActionsOption(SuggestionSelectOptions.MERGE);
      cy.selectCollection('genericWords');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.getActionsOption(SuggestionSelectOptions.DELETE);
    });
  });

  describe('Editor Permissions', () => {
    beforeEach(() => {
      cy.cleanLogin('test@example.com', { role: 'editor', editingGroup: 1 });
    });

    it('user collection doesn\'t exist', () => {
      cy.get('a[href="#/words"]');
      cy.get('a[href="#/users"]').should('not.exist');
    });

    it('merger actions don\'t exist in the list view for words', () => {
      cy.selectCollection('words');
      cy.getActionsOption(DocumentSelectOptions.COMBINE_WORD_INTO).should('not.exist');
    });

    it('merger actions don\'t exist in the show view for words', () => {
      cy.selectCollection('words');
      cy.getActionsOption(DocumentSelectOptions.VIEW).click();
    });

    it('merger actions don\'t exist in list view for wordSuggestions', () => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.MERGE).should('not.exist');
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.DELETE).should('not.exist');
    });

    it('merger actions don\'t exist in show view for wordSuggestions', () => {
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.getActionsOption(SuggestionSelectOptions.MERGE).should('not.exist');
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.getActionsOption(SuggestionSelectOptions.DELETE).should('not.exist');
    });

    it('merger actions don\'t exist in list view for exampleSuggestions', () => {
      cy.createExampleSuggestion();
      cy.selectCollection('exampleSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.MERGE).should('not.exist');
      cy.selectCollection('exampleSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.DELETE).should('not.exist');
    });

    it('merger actions don\'t exist in show view for exampleSuggestions', () => {
      cy.selectCollection('exampleSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.getActionsOption(SuggestionSelectOptions.MERGE).should('not.exist');
      cy.selectCollection('exampleSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.getActionsOption(SuggestionSelectOptions.DELETE).should('not.exist');
    });

    it('bulk actions do not render', () => {
      cy.selectCollection('wordSuggestions');
      cy.get('input[type="checkbox"]').should('not.exist');
    });

    // DEPRECATED: Test is skipped because generic words are not visible to non-admins
    it.skip('merger actions don\'t exist in list view for genericWords', () => {
      cy.selectCollection('genericWords');
      cy.getActionsOption(SuggestionSelectOptions.MERGE).should('not.exist');
      cy.selectCollection('genericWords');
      cy.getActionsOption(SuggestionSelectOptions.DELETE).should('not.exist');
    });

    // DEPRECATED: Test is skipped because generic words are not visible to non-admins
    it.skip('merger actions don\'t exist in show view for genericWords', () => {
      cy.selectCollection('genericWords');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.getActionsOption(SuggestionSelectOptions.MERGE).should('not.exist');
      cy.selectCollection('genericWords');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.getActionsOption(SuggestionSelectOptions.DELETE).should('not.exist');
    });
  });

  describe('Select Options', () => {
    before(() => {
      cy.cleanLogin();
    });

    const fallbackDropdownOptions = (value) => {
      switch (value) {
        case 'Deny':
          cy.get('div').contains(/Deny|Denied/);
          return;
        case 'Approve':
          cy.get('div').contains(/Approve|Approved/);
          return;
        default:
          cy.get('div').contains(value);
      }
    };

    it.skip('render at most five options genericWords in list view', () => {
      cy.selectCollection('genericWords');
      cy.get('.test-select-options').first().click();
      forEach(values(SuggestionSelectOptions), (value) => {
        fallbackDropdownOptions(value);
      });
    });

    it.skip('navigate to the show view for genericWords', () => {
      cy.selectCollection('genericWords');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.contains('Definitions');
      cy.contains('Variations');
    });

    it.skip('open approve confirmation modal for genericWords', () => {
      cy.selectCollection('genericWords');
      cy.getActionsOption(SuggestionSelectOptions.APPROVE).click();
      cy.contains('Approve Document');
      cy.cancelConfirmation();
    });

    it.skip('open deny confirmation modal for genericWords', () => {
      cy.selectCollection('genericWords');
      cy.getActionsOption(SuggestionSelectOptions.DENY).click();
      cy.contains('Deny Document');
      cy.cancelConfirmation();
    });

    it.skip('render the react select menu in the show view', () => {
      cy.selectCollection('genericWords');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.get('.test-select-options').first().click();
    });
  });

  describe('Dashboard', () => {
    it('does not render the dashboard while not authenticated', () => {
      cy.logout();
      cy.visit('/');
      cy.findByText('Welcome on Board!').should('not.exist');
    });
  });

  describe('Already Reviewed Icons', () => {
    before(() => {
      cy.cleanLogin();
    });

    it('render reviewed icon for wordSuggestion', () => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getWordSuggestionDocumentDetails();
      cy.getActionsOption(SuggestionSelectOptions.APPROVE).click();
      cy.acceptConfirmation();
      cy.get('@selectedReviewedIcon').findByTestId('reviewed-icon');
    });

    it.skip('render reviewed icon for exampleSuggestion', () => {
      cy.createExampleSuggestion();
      cy.selectCollection('exampleSuggestions');
      cy.getExampleSuggestionDocumentDetails();
      cy.getActionsOption(SuggestionSelectOptions.DENY).click();
      cy.acceptConfirmation();
      cy.get('@selectedReviewedIcon').find('[data-test="reviewed-icon"]');
    });

    it.skip('render reviewed icon for genericWord', () => {
      cy.selectCollection('genericWords');
      cy.getWordSuggestionDocumentDetails();
      cy.getActionsOption(SuggestionSelectOptions.APPROVE).click();
      cy.acceptConfirmation();
      cy.get('@selectedReviewedIcon').find('[data-test="reviewed-icon"]');
    });
  });

  describe('Jump to Page', () => {
    beforeEach(() => {
      cy.cleanLogin();
    });

    it('jump to page for words', () => {
      cy.selectCollection('words');
      cy.findByTestId('jump-to-page-input').clear().type('10');
      cy.findByText('Jump to page').click();
      cy.findByTestId('pagination-current-page').contains('10');
    });

    it('jump to page for examples', () => {
      cy.selectCollection('examples');
      cy.findByTestId('jump-to-page-input').clear().type('10');
      cy.findByText('Jump to page').click();
      cy.findByTestId('pagination-current-page').contains('10');
    });

    it('jump to page for wordSuggestions', () => {
      times(12, cy.createWordSuggestion);
      cy.selectCollection('wordSuggestions');
      cy.findByTestId('jump-to-page-input').clear().type('2');
      cy.findByText('Jump to page').click();
      cy.findByTestId('pagination-current-page').contains('2');
    });

    it('jump to page for exampleSuggestions', () => {
      times(12, cy.createExampleSuggestion);
      cy.selectCollection('exampleSuggestions');
      cy.findByTestId('jump-to-page-input').clear().type('2');
      cy.findByText('Jump to page').click();
      cy.findByTestId('pagination-current-page').contains('2');
    });
  });
});
