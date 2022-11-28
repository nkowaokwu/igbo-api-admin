import { forEach, values, times } from 'lodash';
import { DocumentSelectOptions, SuggestionSelectOptions, UserSelectOptions } from '../../constants';

describe('Editor platform', () => {
  describe('Signup Page', () => {
    before(() => {
      cy.cleanLogin();
    });
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
    before(() => {
      cy.cleanLogin();
    });
    it('user collection exists', () => {
      cy.get('a[href="#/users"]').click();
    });

    it('change editingGroup for an editor', () => {
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
      cy.selectCollection('wordSuggestions');
      cy.get('input[type="checkbox"]').should('exist');
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
  });

  describe('Editor Permissions', () => {
    before(() => {
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

  describe('Dashboard', () => {
    it('does not render the dashboard while not authenticated', () => {
      cy.logout();
      cy.visit('/');
      cy.findByText('Welcome on Board!').should('not.exist');
    });
  });

  describe('You Reviewed Icons', () => {
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

    it('render reviewed icon for exampleSuggestion', () => {
      cy.createExampleSuggestion();
      cy.selectCollection('exampleSuggestions');
      cy.getExampleSuggestionDocumentDetails();
      cy.getActionsOption(SuggestionSelectOptions.DENY).click();
      cy.acceptConfirmation();
      cy.get('@selectedReviewedIcon').find('[data-test="reviewed-icon"]');
    });
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
