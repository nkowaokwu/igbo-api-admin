import { v4 as uuidv4 } from 'uuid';
import Dialects from '../../../src/backend/shared/constants/Dialects';
import {
  DocumentSelectOptions,
  SuggestionSelectOptions,
  WordClassOptions,
  DialectOptions,
} from '../../constants';

const errorMessage = 'An error occurred while saving';
describe('Create', () => {
  before(() => {
    cy.cleanLogin();
  });

  describe('Word Suggestions', () => {
    it('render the custom create view for wordSuggestions', { scrollBehavior: false }, () => {
      cy.selectCollection('words');
      cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
      cy.findByTestId('word-input');
      cy.findAllByTestId('word-class-input-container').eq(0);
      cy.get('[data-test*="definitions-"]');
    });

    it('show the newly created wordSuggestions', () => {
      cy.selectCollection('words');
      cy.getWordDocumentDetails();
      cy.get('@selectedId').then(([$selectedId]) => {
        cy.get('@selectedWord').then(([$selectedWord]) => {
          cy.getActionsOption(DocumentSelectOptions.VIEW).click();
          cy.findByText('Suggest an Edit').click();
          cy.findByText('Create New Word Suggestion');
          cy.findByText('Parent Word Id:');
          cy.findByText($selectedId.innerText);
          cy.get(`[value="${$selectedWord.innerText}"]`);
        });
      });
    });

    it('stop from submitting an incomplete wordSuggestion', () => {
      cy.selectCollection('wordSuggestions');
      cy.findByRole('button', { name: 'Create' }).click();
      cy.findAllByTestId('nested-definitions-0-input').clear();
      cy.get('button[type="submit"]').click();
      cy.findByText('Word is required');
      cy.findByText('Definition is required');
    });

    it('create a new wordSuggestion and update with part of speech', () => {
      const word = 'new word';
      const definition = 'first definition';
      cy.selectCollection('wordSuggestions');
      cy.findByRole('button', { name: 'Create' }).click();
      cy.findByTestId('word-input').type(word);
      cy.findAllByTestId('word-class-input-container').eq(0).click();
      cy.findByText(WordClassOptions.PRN.label).click();
      cy.findByTestId('nested-definitions-0-input').type(definition);
      cy.get('button[type="submit"]').click();
      cy.findAllByText(word);
      cy.findByText('Pronoun');
      cy.findByText(definition);
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.findAllByTestId('word-class-input-container').eq(0).click();
      cy.findByText(WordClassOptions.ADV.label).click();
      cy.get('button[type="submit"]').click();
      cy.findAllByText(word);
      cy.findByText(WordClassOptions.ADV.label);
      cy.findByText(definition);
    });

    it('create a new wordSuggestion and merge with dialect', () => {
      const word = uuidv4();
      const definition = 'first definition';
      cy.intercept('POST', '**/words').as('mergeWord');
      cy.selectCollection('wordSuggestions');
      cy.findByRole('button', { name: 'Create' }).click();
      cy.findByTestId('word-input').type(word);
      cy.findAllByTestId('word-class-input-container').eq(0).click();
      cy.findByText(WordClassOptions.PRN.label).click();
      cy.findByTestId('nested-definitions-0-input').type(definition);
      cy.findByRole('button', { name: 'Add Dialectal Variation' }).click();
      cy.findByTestId('dialects-input-container-0').click();
      cy.findByText(Dialects.NSA.label).click();
      cy.findByTestId('dialects-0-word-input').clear().type('NSA word dialect')
      cy.get('button[type="submit"]').click();
      cy.findByText('Word Suggestion Document Details');
      cy.findByText('NSA word dialect');
    });

    it('create a new word suggestion with nested exampleSuggestions', () => {
      const word = uuidv4();
      const definition = 'first definition';
      const firstIgboSentence = 'first igbo sentence';
      const secondIgboSentence = 'second igbo sentence';
      const firstEnglishSentence = 'first english sentence';
      const secondEnglishSentence = 'second english sentence';
      const updatedIgbo = 'UPDATED IGBO';
      const updatedEnglish = 'UPDATED ENGLISH';
      cy.intercept('POST', '**/words').as('mergeWord');
      cy.selectCollection('wordSuggestions');
      cy.findByRole('button', { name: 'Create' }).click();
      cy.findByTestId('word-input').type(word);
      cy.findAllByTestId('word-class-input-container').eq(0).click();
      cy.findByText(WordClassOptions.PRN.label).click();
      cy.findByTestId('nested-definitions-0-input').type(definition);
      cy.findByLabelText('Add Example').click();
      cy.findByTestId('examples-0-igbo-input').clear().type(firstIgboSentence);
      cy.findByTestId('examples-0-english-input').clear().type(firstEnglishSentence);
      cy.findByLabelText('Add Example').click();
      cy.findByTestId('examples-1-igbo-input').clear().type(secondIgboSentence);
      cy.findByTestId('examples-1-english-input').clear().type(secondEnglishSentence);
      cy.get('button[type="submit"]').click();
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.findByTestId('examples-0-igbo-input').clear().type(updatedIgbo);
      cy.findByTestId('examples-0-english-input').clear().type(updatedEnglish);
      cy.get('button[type="submit"]').click();
      cy.findByText(secondIgboSentence);
      cy.findByText(secondEnglishSentence);
      cy.findByText(updatedIgbo);
      cy.findByText(updatedEnglish);
    });

    it('render an error notification for word form upon submitting', () => {
      cy.createWordSuggestion();
      const word = 'new word';
      cy.intercept('POST', '**/wordSuggestions', {
        statusCode: 400,
        body: { error: errorMessage },
      }).as('postWordSuggestionFailure');
      cy.selectCollection('wordSuggestions');
      cy.get('button').contains('Create').click();
      cy.findByTestId('word-input').type(word);
      cy.findAllByTestId('word-class-input-container').eq(0).click();
      cy.findByText(WordClassOptions.CJN.label).click();
      cy.findByTestId('nested-definitions-0-input').type('first definition');
      cy.get('button[type="submit"]').click();
      cy.wait('@postWordSuggestionFailure');
      cy.findByText(errorMessage);
    });
  });

  describe('Example Suggestions', () => {
    it('render the custom create view for exampleSuggestions', () => {
      cy.selectCollection('examples');
      cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
      cy.findByTestId('igbo-input');
      cy.findByTestId('english-input');
      cy.findByTestId('associatedWord-search');
    });

    it('show the newly created exampleSuggestions', () => {
      cy.selectCollection('examples');
      cy.getActionsOption(DocumentSelectOptions.VIEW).click();
      cy.get('button').contains('Suggest an Edit').click();
      cy.findByTestId('igbo-input').type('igbo');
      cy.findByTestId('english-input').type('english');
      cy.get('button[type="submit"]').click();
      cy.contains('Example Suggestion Document Details');
    });

    it('doesn\'t submit form due to incomplete exampleSuggestion', () => {
      cy.selectCollection('examples');
      cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
      cy.findByTestId('igbo-input').clear();
      cy.findByTestId('english-input').clear();
      cy.findByTestId('associatedWord-search');
      cy.intercept('POST', '**/api/v1/exampleSuggestions').as('failedExampleSuggestion');
      cy.get('button[type="submit"]').click();
      cy.findByText('Igbo is required');
    });

    it('link to the nested example', () => {
      const word = uuidv4();
      const igbo = 'igbo example';
      const english = 'english example';
      cy.selectCollection('wordSuggestions');
      cy.get('button').contains('Create').click();
      cy.findByTestId('word-input').type(word);
      cy.findAllByTestId('word-class-input-container').eq(0).click();
      cy.findByText(WordClassOptions.CJN.label).click();
      cy.findByTestId('nested-definitions-0-input').type('first definition');
      cy.get('[aria-label="Add Example"]').click({ force: true });
      cy.findByTestId('examples-0-igbo-input').type(igbo);
      cy.findByTestId('examples-0-english-input').type(english);
      cy.intercept('GET', '**/wordSuggestions/**').as('getWordSuggestion');
      cy.get('button[type="submit"]').click();
      cy.wait('@getWordSuggestion');
      cy.findByText('Word Suggestion Document Details');
      cy.findByText('Link to Example').click();
      cy.findByText('Example Suggestion Document Details');
      cy.findByText(igbo);
      cy.findByText(english);
    });

    it('render an error notification for example form upon submitting', () => {
      cy.createExampleSuggestion();
      cy.intercept('PUT', '**/exampleSuggestions/**', {
        statusCode: 400,
        body: { error: errorMessage },
      }).as('putExampleSuggestionFailure');
      cy.selectCollection('examples');
      cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
      cy.findByTestId('igbo-input').clear().type('igbo word');
      cy.findByTestId('english-input').clear().type('english word');
      cy.findByTestId('associatedWord-search').clear().type('5f864d7401203866b6546dd3');
      cy.get('button[type="submit"]').click();
      cy.wait('@putExampleSuggestionFailure');
      cy.findByText(`${errorMessage} example suggestion`);
    });
  });
});
