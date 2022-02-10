import { times } from 'lodash';
import { SuggestionSelectOptions } from '../../constants';

describe('List', () => {
  describe('Words', () => {
    before(() => {
      cy.seedDatabase();
      cy.cleanLogin();
      cy.selectCollection('words');
    });

    it('filter through filters', () => {
      cy.get('button').contains('Filters').scrollIntoView().click({ force: true });
      cy.findAllByRole('menuitemcheckbox').contains('Is Standard Igbo').click({ force: true });
      cy.get('[aria-checked="true"][value="isStandardIgbo"]').should('exist');
      cy.findAllByRole('menuitemcheckbox').contains('Has Pronunciation').click({ force: true });
      cy.get('[aria-checked="true"][value="pronunciation"]').should('exist');
    });

    it('select 10 rows from table pagination', () => {
      cy.get('#menu-button-per-page-menu').click();
      cy.get('button[data-index="0"]').contains('10').click();
      cy.get('.datagrid-body').find('tr[class*="RaDatagrid-row-"]').then((res) => {
        expect(res.length).to.equal(10);
      });
    });

    it('select 25 rows from table pagination', () => {
      cy.get('#menu-button-per-page-menu').click();
      cy.get('button[data-index="1"]').contains('25').click();
      cy.wait(2000);
      cy.get('.datagrid-body').find('tr[class*="RaDatagrid-row-"]').then((res) => {
        expect(res.length).to.equal(25);
      });
    });

    it('select 50 rows from table pagination', () => {
      cy.intercept('GET', '**/words/**').as('getWords');
      cy.get('#menu-button-per-page-menu').click();
      cy.get('button[data-index="2"]').contains('50').click();
      cy.wait(2000);
      cy.get('.datagrid-body').find('tr[class*="RaDatagrid-row-"]').then((res) => {
        expect(res.length).to.equal(50);
      });
    });

    it('renders not standard for is standard igbo column', () => {
      cy.findAllByText('Not Standard').first();
    });

    it('renders standard for is standard igbo column', () => {
      cy.intercept('PUT', '**/wordSuggestions/**').as('updateWordSuggestion');
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions', true);
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.get('[data-test="isStandardIgbo-checkbox"]').find('input').then(([checkbox]) => {
        if (!checkbox.checked) {
          cy.findByTestId('isStandardIgbo-checkbox').click();
        }
        cy.findByTestId('word-input').then(([word]) => {
          cy.get('button[type="submit"]').click();
          /**
           * Race condition:
           * The platform navigates to the word doc before the word doc saves,
           * which causes the test to fail
           * */
          cy.wait('@updateWordSuggestion').then(({ response }) => {
            expect(response.statusCode).to.equal(200);
            cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
            cy.acceptConfirmation();
            cy.contains('Word Document Details');
            cy.selectCollection('words', true);
            cy.searchForDocument(word.value);
            cy.findAllByTestId('standard-igbo-cell').first();
          });
        });
      });
    });
  });

  describe('Examples', () => {
    before(() => {
      cy.cleanLogin();
      cy.selectCollection('examples');
    });

    it('select 10 rows from table pagination', () => {
      cy.get('#menu-button-per-page-menu').click();
      cy.get('button[data-index="0"]').contains('10').click();
      cy.get('.datagrid-body').find('tr[class*="RaDatagrid-row-"]').then((res) => {
        expect(res.length).to.equal(10);
      });
    });

    it('select 25 rows from table pagination', () => {
      cy.intercept('GET', '**/examples/**').as('getExamples');
      cy.get('#menu-button-per-page-menu').click();
      cy.get('button[data-index="1"]').contains('25').click();
      cy.wait(2000);
      cy.get('.datagrid-body').find('tr[class*="RaDatagrid-row-"]').then((res) => {
        expect(res.length).to.equal(25);
      });
    });

    it('select 50 rows from table pagination', () => {
      cy.intercept('GET', '**/examples/**').as('getExamples');
      cy.get('#menu-button-per-page-menu').click();
      cy.get('button[data-index="2"]').contains('50').click();
      cy.wait(2000);
      cy.get('.datagrid-body').find('tr[class*="RaDatagrid-row-"]').then((res) => {
        expect(res.length).to.equal(50);
      });
    });
  });

  describe('Word Suggestions', () => {
    before(() => {
      cy.cleanLogin();
    });

    beforeEach(() => {
      times(15, cy.createWordSuggestion);
      cy.selectCollection('wordSuggestions');
    });

    it('bulk merge all word suggestion documents', () => {
      cy.getWordSuggestionDocumentDetails();
      cy.get('@selectedWord').then(([$word]) => {
        cy.get('input[type="checkbox"]').first().click();
        cy.findByTestId('bulk-merge-button').click();
        cy.acceptConfirmation();
        cy.get('@selectedWord').should('not.exist');
        cy.selectCollection('words');
        cy.searchForDocument($word.innerText);
        cy.contains($word.innerText);
      });
    });
  });
});
