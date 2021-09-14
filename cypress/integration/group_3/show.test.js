import { DocumentSelectOptions, SuggestionSelectOptions, WordClassOptions } from '../../constants';

describe.skip('Show', () => {
  beforeEach(() => {
    cy.cleanLogin();
  });

  it('render the show view of a word', () => {
    cy.selectCollection('words');
    cy.getWordDetails(0);
    cy.get('@selectedWord').then(([word]) => {
      cy.get('@selectedId').then(([id]) => {
        cy.intercept('GET', `/words${id.innerText}`).as('getWord');
        cy.getActionsOption(DocumentSelectOptions.VIEW).click();
        cy.wait('@getWord').then(({ response }) => {
          const { body } = response;
          expect(body.examples).to.be.an('array');
          cy.findByText(word.innerText);
          cy.findByTestId('definition-0');
        });
      });
    });
  });

  it('render the show view with diffing word', () => {
    const definition = 'updated first definition';
    const igboSentence = 'first igbo sentence';
    const englishSentence = 'first english sentence';
    cy.selectCollection('words');
    cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
    cy.findByTestId('word-class-input-container').click();
    cy.findByText(WordClassOptions.PRN.label).click();
    cy.findByTestId('definitions-0-input').clear().type(definition);
    cy.findByTestId('dialects-OWE-word-input').clear().type('OWE word dialect');
    cy.findByText('Add Example').click();
    cy.findByTestId('examples-0-igbo-input').clear().type(igboSentence);
    cy.findByTestId('examples-0-english-input').clear().type(englishSentence);
    cy.get('button[type="submit"]').click();
    cy.get('.addition-change').contains('PRN');
    cy.get('.addition-change').contains(definition);
  });

  it('render no diffing for word show view', () => {
    const definition = 'updated first definition';
    const igboSentence = 'first igbo sentence';
    const englishSentence = 'first english sentence';
    cy.intercept('POST', '**words').as('mergeWord');
    cy.selectCollection('words');
    cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
    cy.findByTestId('word-class-input-container').click();
    cy.findByText(WordClassOptions.PRN.label).click();
    cy.findByTestId('definitions-0-input').clear().type(definition);
    cy.findByTestId('dialects-OWE-word-input').clear().type('OWE word dialect');
    cy.findByText('Add Example').click();
    cy.findByTestId('examples-0-igbo-input').clear().type(igboSentence);
    cy.findByTestId('examples-0-english-input').clear().type(englishSentence);
    cy.get('button[type="submit"]').click();
    cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
    cy.acceptConfirmation();
    cy.wait('@mergeWord').then(({ response }) => {
      const { id } = response.body;
      cy.visit(`#/words/${id}/show`);
      cy.get('.addition-change').should('not.exist');
      cy.get('.addition-change').should('not.exist');
      cy.contains(igboSentence);
      cy.contains(englishSentence);
      cy.contains('Link to Example').click();
      cy.findByText('Example Document Details');
    });
  });

  it('render the show view of an example', () => {
    cy.selectCollection('examples');
    cy.getExampleDetails();
    cy.get('@selectedIgbo').then(([igbo]) => {
      cy.get('@selectedEnglish').then(([english]) => {
        cy.getActionsOption(DocumentSelectOptions.VIEW).click();
        cy.findByText(igbo.innerText);
        cy.findByText(english.innerText);
      });
    });
  });

  it('render the show view of a wordSuggestion', () => {
    cy.selectCollection('wordSuggestions');
    cy.getWordSuggestionDocumentDetails();
    cy.get('@selectedWord').then(([word]) => {
      cy.getActionsOption(DocumentSelectOptions.VIEW).click();
      cy.findByText(word.innerText);
      cy.findByTestId('definition-0');
    });
  });

  it('render the show view of an exampleSuggestion', () => {
    cy.selectCollection('exampleSuggestions');
    cy.getExampleSuggestionDocumentDetails();
    cy.get('@selectedIgbo').then(([igbo]) => {
      cy.getActionsOption(DocumentSelectOptions.VIEW).click();
      cy.findByText(igbo.innerText);
    });
  });

  it.skip('render the show view of a genericWord', () => {
    cy.selectCollection('genericWords');
    cy.getWordSuggestionDocumentDetails();
    cy.get('@selectedWord').then(([word]) => {
      cy.getActionsOption(DocumentSelectOptions.VIEW).click();
      cy.contains(word.innerText);
      cy.findByTestId('definition-0');
    });
  });
});
