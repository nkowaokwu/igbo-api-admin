import { v4 as uuidv4 } from 'uuid';
import { every } from 'lodash';
import { DocumentSelectOptions, SuggestionSelectOptions, WordClassOptions } from '../../constants';

const awsUriPrefix = 'https://igbo-api-test-local/audio-pronunciations/';
describe('Edit', () => {
  before(() => {
    cy.cleanLogin();
  });
  describe('Audio Pronunciation Uploading', () => {

    beforeEach(() => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
    });
    it('merge audio headword and dialect audio pronunciations for an existing word', () => {
      cy.intercept('PUT', '**/wordSuggestions/**').as('putWordSuggestion');
      cy.findByTestId('word-class-input-container').click();
      cy.findAllByText(WordClassOptions.CJN.label).click({ force: true, multiple: true });
      cy.recordAudio();
      cy.recordAudio('dialects.0');
      cy.intercept('GET', '**/wordSuggestions/**').as('getWordSuggestion');
      cy.get('button[type="submit"]').click();
      cy.wait('@putWordSuggestion');
      cy.wait('@getWordSuggestion').then(({ response: getWordSuggestionResponse }) => {
        const { body } = getWordSuggestionResponse;
        expect(getWordSuggestionResponse.body.pronunciation.includes(body.id)).to.equal(true);
        expect(getWordSuggestionResponse.body.dialects[0].pronunciation.includes(body.dialects[0].id)).to.equal(true);

        cy.intercept('GET', '**/words/**').as('getWord');
        cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
        cy.acceptConfirmation();
        cy.wait('@getWord').then(({ response: postWordResponse }) => {
          const { body } = postWordResponse;
          expect(body.pronunciation.includes(body.id)).to.equal(true);
          expect(body.dialects[0].pronunciation.includes(body.id)).to.equal(true);

          cy.intercept('GET', '**/wordSuggestions/**').as('createWordWithWordSuggestion');
          cy.wait(1000);
          cy.get('button').contains('Suggest an Edit').click();
          cy.wait(1000);
          cy.recordAudio();
          cy.recordAudio('dialects.0');
          cy.get('button[type="submit"]').click();

          cy.wait('@createWordWithWordSuggestion').then(({ response: newWordSuggestionResponse }) => {
            const { body } = newWordSuggestionResponse;
            expect(body.pronunciation.includes(body.id)).to.equal(true);
            expect(body.dialects[0].pronunciation.includes(body.id)).to.equal(true);
          });
        });
      });
    });

    it('merge audio headword and dialect audio pronunciations for a new word', () => {
      cy.intercept('PUT', '**/wordSuggestions/**').as('putWordSuggestion');
      cy.findByTestId('word-class-input-container').click();
      cy.findAllByText(WordClassOptions.NM.label).click({ force: true, multiple: true });
      cy.intercept('GET', '**/wordSuggestions/**').as('getWordSuggestion');
      cy.recordAudio();
      cy.recordAudio('dialects.0');
      cy.get('button[type="submit"]').click();
      cy.wait('@putWordSuggestion');
      cy.wait('@getWordSuggestion').then(({ response: getWordSuggestionResponse }) => {
        const { body } = getWordSuggestionResponse;
        expect(body.pronunciation.includes(body.id)).to.equal(true);
        expect(body.dialects[0].pronunciation.includes(body.id)).to.equal(true);

        cy.intercept('GET', '**/words/**').as('getWord');
        cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
        cy.acceptConfirmation();
        cy.wait('@getWord').then(({ response: postWordResponse }) => {
          const { body } = postWordResponse;
          expect(body.pronunciation.includes(body.id)).to.equal(true)
          expect(body.dialects[0].pronunciation.includes(body.id)).to.equal(true);
        });
      });
    });

    it('save audio headword and dialect pronunciations for word suggestion', () => {
      cy.intercept('PUT', '**/wordSuggestions/**').as('putWordSuggestion');
      cy.findByTestId('word-class-input-container').click();
      cy.findAllByText(WordClassOptions.CJN.label).click({ force: true, multiple: true });
      cy.intercept('GET', '**/wordSuggestions/**').as('getWordSuggestion');
      cy.recordAudio();
      cy.recordAudio('dialects.0');
      cy.get('button[type="submit"]').click();
      cy.wait('@putWordSuggestion');
      cy.wait('@getWordSuggestion').then(({ response }) => {
        const { body } = response;
        expect(response.body.pronunciation.includes(body.id)).to.equal(true);
        expect(response.body.dialects[0].pronunciation.includes(body.id)).to.equal(true);
      });
    });

    it('reset audio headword pronunciation for word suggestion', () => {
      cy.intercept('PUT', '**/wordSuggestions/**').as('putWordSuggestion');
      cy.findByTestId('word-class-input-container').click();
      cy.findAllByText(WordClassOptions.CJN.label).click({ force: true, multiple: true });
      cy.intercept('GET', '**/wordSuggestions/**').as('getWordSuggestion');
      cy.recordAudio();
      cy.recordAudio('dialects.0');
      cy.get('button[type="submit"]').click();
      cy.wait('@putWordSuggestion');
      cy.wait('@getWordSuggestion').then(({ response }) => {
        const { body } = response;
        expect(response.body.pronunciation.includes(body.id)).to.equal(true);
        expect(response.body.dialects[0].pronunciation.includes(body.id)).to.equal(true);
      });
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click({ scrollBehavior: false });
      cy.recordAudio();
      cy.findAllByLabelText('Reset recording').first().click();
      cy.findByText('Reset Audio Pronunciation');
    });
  });

  describe('Multiple Audio Pronunciation Uploading', () => {
    it.only('merge multiple audio for example sentences', () => {
      cy.intercept('PUT', '**/wordSuggestions/**').as('putWordSuggestion');
      cy.findByRole('button', { name: 'Create' }).click();
      cy.findByTestId('word-input').type(word);
      cy.findAllByTestId('word-class-input-container').eq(0).click();
      cy.findAllByText(WordClassOptions.AV.label).click({ force: true, multiple: true });
      cy.findByTestId('nested-definitions-0-input').type(definition);
      cy.intercept('GET', '**/wordSuggestions/**').as('getWordSuggestion');
      cy.findByLabelText('Add Example').click();
      cy.findByTestId('examples-0-igbo-input').clear().type('Recording audio for Igbo sentence');
      cy.findByTestId('examples-0-english-input').clear().type('Recording audio for English sentence');
      cy.recordExampleAudio();
      cy.recordExampleAudio(1);

    });
  })

  describe.only('Word Edit', () => {
    it('render the edit view for word suggestions', () => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.findAllByText('Headword');
      cy.findAllByText('Part of Speech');
      cy.findAllByText('Definitions');
    });

    // TODO: Consider combining this and the next test together
    it('render the word view after adding relatedTerm and merge', () => {
      cy.createWordSuggestion().then((word) => {
        cy.selectCollection('words');
        cy.searchForDocument('onye');
        cy.getWordDetails(0);
          cy.get('@selectedId').then(([id]) => {
            cy.selectCollection('wordSuggestions');
            cy.searchForDocument(word);
            cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
            cy.findByTestId('relatedTerm-search').clear().type(id.innerText);
            cy.findByLabelText('Add Related Term').click();
            cy.findByTestId('word-pill-0');
            cy.get('button[type="submit"]').click();
            cy.findByText('onye');
            cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
            cy.acceptConfirmation();
            cy.findByText('Word Document Details');
            cy.findByText('onye');
          });
      });
    });

    it('render the word suggestion, delete the relatedTerm, and merge', () => {
      cy.createWordSuggestion().then((word) => {
        cy.selectCollection('words');
        cy.searchForDocument('onye');
        cy.getWordDetails(0);
          cy.get('@selectedId').then(([id]) => {
            cy.selectCollection('wordSuggestions');
            cy.searchForDocument(word);
            cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
            cy.findByTestId('relatedTerm-search').clear().type(id.innerText);
            cy.findByLabelText('Add Related Term').click();
            cy.findByTestId('word-pill-0');
            cy.get('button[type="submit"]').click();
            cy.findAllByText('onye').should('be.visible');
            cy.getActionsOption(SuggestionSelectOptions.EDIT).click({ force: true, scrollBehavior: false });
            cy.findAllByLabelText('Remove').first().click();
            cy.get('button[type="submit"]').click();
            cy.findAllByText('onye').should('not.exist');
            cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
            cy.acceptConfirmation();
            cy.findByText('Word Document Details');
            cy.findAllByText('onye').should('not.exist');
          });
        });
    });

    it('render the same amount of nested examples', () => {
      const word = uuidv4();
      const definition = 'first definition';
      const firstIgboSentence = 'first igbo sentence';
      const firstEnglishSentence = 'first english sentence';
      cy.intercept('POST', '**/words').as('mergeWord');
      cy.selectCollection('wordSuggestions');
      cy.get('button').contains('Create').click();
      cy.findByTestId('word-input').type(word);
      cy.findByTestId('word-class-input-container').click();
      cy.findByText(WordClassOptions.PRN.label).click();
      cy.findByTestId('nested-definitions-0-input').type(definition);
      cy.findByLabelText('Add Example').click();
      cy.findByTestId('examples-0-igbo-input').clear().type(firstIgboSentence);
      cy.findByTestId('examples-0-english-input').clear().type(firstEnglishSentence);
      cy.get('button[type="submit"]').click();
      cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
      cy.acceptConfirmation();
      cy.contains('Word Document Details');
      cy.get('a[href="#/words"]').click();
      cy.searchForDocument(word);
      cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
      cy.intercept('GET', '**/wordSuggestions/**').as('updateWordSuggestion');
      cy.get('button[type="submit"]').click();
      cy.wait('@updateWordSuggestion');
      cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
      cy.acceptConfirmation();
      cy.contains('Word Document Details');
      cy.findByTestId('example-1').should('not.exist');
    });

    it('render the is standard igbo value in edit view', () => {
      cy.selectCollection('wordSuggestions');
      cy.createWordSuggestion().then((word) => {
        cy.searchForDocument(word);
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        cy.get('[data-test="isStandardIgbo-checkbox"][checked]').should('not.exist');
        cy.findByTestId('isStandardIgbo-checkbox').click();
        cy.get('button[type="submit"]').click();
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click({ force: true });
        cy.get('label[data-test="isStandardIgbo-checkbox"]').find('input[checked]');
      });
    });

    it('render the same data for dialects', () => {
      cy.selectCollection('wordSuggestions');
      cy.createWordSuggestion().then((word) => {
        cy.searchForDocument(word);
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        cy.findByTestId('dialects-0-word-input').clear().type('this is a dialect');
        cy.findByText('A change in this dialect has been detected. Please consider re-recording the audio to match.');
        cy.get('button[type="submit"]').click();
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click({ force: true });
        cy.findByTestId('dialects-0-word-input').should('have.value', 'this is a dialect');
      });
    });

    it('toggle between different dialect views', () => {
      cy.selectCollection('wordSuggestions');
      cy.createWordSuggestion().then((word) => {
        cy.searchForDocument(word);
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        cy.recordAudio();
        cy.findByTestId('dialects-input-container-0').first().click();
        cy.wait(300);
        cy.findByText('Nsa').click();
        cy.findByTestId('dialects-0-word-input').clear().type('this is another dialect');
        cy.findByTestId('dialects-input-container-0').first().click();
        cy.wait(300);
        cy.findByTestId('dialects-input-container-0').contains('Afikpo').click();
        cy.findByTestId('dialects-input-container-0').contains('Nsa').click();
        cy.findByTestId('dialects-0-word-input').should('have.value', 'this is another dialect');
        cy.get('button[type="submit"]').click();
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click({ force: true });
        cy.findByTestId('dialects-0-word-input').should('have.value', 'this is another dialect');
      });
    });

    it('render the same data between the string and array views for definitions', () => {
      const firstDefinition = 'first definition';
      const secondDefinition = 'second definition';
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.findByTestId('nested-definitions-0-input').clear().type(firstDefinition);
      cy.findByText('Add English Definition').click();
      cy.findByTestId('nested-definitions-1-input').clear().type(secondDefinition);
      cy.get('textarea').contains(secondDefinition);
      cy.get('button[type="submit"]').click();
      cy.get('[data-test*="definitions."]').then((definitions) => {
        expect(every(definitions, (definition) => !(definition.innerText.length < 1))).to.equal(true);
      });
    });

    it('return the same nested example suggestions for editing an existing word', () => {
      const word = uuidv4();
      const definition = 'first definition';
      const firstIgboSentence = 'first igbo sentence';
      const firstEnglishSentence = 'first english sentence';
      const extraText = 'extra text';
      cy.intercept('POST', '**/words').as('mergeWord');
      cy.get('a[href="#/wordSuggestions"]').click();
      cy.get('button').contains('Create').click();
      cy.findByTestId('word-input').type(word);
      cy.findByTestId('word-class-input-container').click();
      cy.findByText(WordClassOptions.PRN.label).click();
      cy.findByTestId('nested-definitions-0-input').type(definition);
      cy.findByLabelText('Add Example').click();
      cy.findByTestId('examples-0-igbo-input').clear().type(firstIgboSentence);
      cy.findByTestId('examples-0-english-input').clear().type(firstEnglishSentence);
      cy.get('button[type="submit"]').click();
      cy.findByText('Word Suggestion Document Details').should('be.visible');
      cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
      cy.acceptConfirmation();
      cy.contains('Word Document Details');
      cy.findByText(firstIgboSentence);
      cy.findByText(firstEnglishSentence);
      cy.findByRole('button', { name: 'Suggest an Edit' }).click();
      cy.findByTestId('examples-0-igbo-input').should('have.value', firstIgboSentence);
      cy.findByTestId('examples-0-english-input').should('have.value', firstEnglishSentence);
      cy.findByTestId('examples-0-igbo-input').type(extraText);
      cy.get('button[type="submit"]').click();
      cy.findByText(`${firstIgboSentence}${extraText}`).should('be.visible');
      cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
      cy.acceptConfirmation();
      cy.contains('Word Document Details');
      cy.findByText(`${firstIgboSentence}${extraText}`);
    });
  });

  describe.skip('Edit Form', () => {
    it('render the edit view for example suggestions', () => {
      cy.createExampleSuggestion();
      cy.get('a[href="#/exampleSuggestions').click();
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.get('h1').contains('Igbo');
      cy.get('h1').contains('English');
      cy.get('h1').contains('Associated Words');
    });

    it('render the same values after suggesting edit for word', () => {
      cy.selectCollection('words');
      cy.intercept('GET', '**/wordSuggestions/**').as('getWordSuggestion');
      cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
      cy.findByTestId('word-class-input-container').click();
      cy.contains(WordClassOptions.NNC.label).click({ force: true });
      cy.findByText('Add Stem').click();
      cy.get('[name="stems[0]"]').clear().type('first stem');
      cy.recordAudio();
      cy.wait(1000);
      cy.get('button[type="submit"]').click();
      cy.findByText('Word Suggestion Document Details').should('be.visible');
      cy.wait('@getWordSuggestion').then(({ response: wordSuggestionResponse }) => {
        const { body } = wordSuggestionResponse;
        expect(`${awsUriPrefix}${body.id}`).to.equal(body.pronunciation);
        cy.findByText('first stem');
        cy.intercept('GET', '**/words/**').as('getWord');
        cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
        cy.acceptConfirmation();
        cy.wait('@getWord').then(({ response: wordResponse }) => {
          const { body } = wordResponse;
          expect(`${awsUriPrefix}${body.id}`).to.equal(body.pronunciation);
          cy.contains('Word Document Details');
          cy.findAllByText('first stem').first();
          cy.selectCollection('words');
          cy.getWordDetails(0);
          cy.get('@selectedPartOfSpeech').then(([partOfSpeech]) => {
            cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
            cy.get('button[type="submit"]');
            cy.findByText(partOfSpeech.innerText);
          });
        });
      });
    });

    it('render the same values with changing edit form', () => {
      cy.selectCollection('words');
      cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
      cy.get('button[type="submit"]').click();
      cy.contains('Something went wrong').should('not.exist');
    });

    it('redirect editor to pre-existing suggestion', () => {
      cy.selectCollection('words');
      cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
      cy.intercept('PUT', '**/wordSuggestions/**').as('updateWordSuggestion');
      cy.findByTestId('word-input').clear().type('new word');
      cy.get('button[type="submit"]').click();
      cy.wait('@updateWordSuggestion').then(({ request, response }) => {
        expect(request.body.id).to.not.equal(request.body.originalWordId);
        expect(response.body.id).to.not.equal(request.body.originalWordId);
      });
      cy.findByText('Word Suggestion Document Details').should('be.visible');
      cy.selectCollection('words');
      cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
      cy.findAllByText("We've redirected you to a pre-existing word suggestion, to avoid suggestion duplication.");
    });
  });
});
