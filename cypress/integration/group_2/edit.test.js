import { v4 as uuidv4 } from 'uuid';
import { every } from 'lodash';
import { DocumentSelectOptions, SuggestionSelectOptions, WordClassOptions } from '../../constants';

const awsUriPrefix = 'https://igbo-api-test-local/audio-pronunciations/';
describe('Edit', () => {
  describe('Audio Pronunciation Uploading', () => {
    beforeEach(() => {
      cy.cleanLogin();
    });

    it('merge audio headword and dialect audio pronunciations for an existing word', () => {
      cy.intercept('PUT', '**/wordSuggestions/**', (req) => {
        req.alias = 'putWordSuggestion';
        req.body.pronunciation = req.body.id;
        req.body.dialects.NSA.pronunciation = req.body.id;
      }).as('putWordSuggestion');
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.findByTestId('word-class-input-container').click();
      cy.findAllByText(WordClassOptions.CJN.label).click({ force: true, multiple: true });
      cy.recordAudio();
      cy.recordAudio('NSA');
      cy.intercept('GET', '**/wordSuggestions/**').as('getWordSuggestion');
      cy.get('button[type="submit"]').click();
      cy.wait('@putWordSuggestion');
      cy.wait('@getWordSuggestion').then(({ response: getWordSuggestionResponse }) => {
        expect(getWordSuggestionResponse.body.pronunciation)
          .to.equal(`${awsUriPrefix}${getWordSuggestionResponse.body.id}`);
        expect(getWordSuggestionResponse.body.dialects.NSA.pronunciation)
          .to.equal(`${awsUriPrefix}${getWordSuggestionResponse.body.id}-NSA`);

        cy.intercept('GET', '**/words/**').as('getWord');
        cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
        cy.acceptConfirmation();
        cy.wait('@getWord').then(({ response: postWordResponse }) => {
          expect(postWordResponse.body.pronunciation)
            .to.equal(`${awsUriPrefix}${postWordResponse.body.id}`);
          expect(postWordResponse.body.dialects.NSA.pronunciation)
            .to.equal(`${awsUriPrefix}${postWordResponse.body.id}-NSA`);

          cy.intercept('GET', '**/wordSuggestions/**').as('createWordWithWordSuggestion');
          cy.wait(2000);
          cy.get('button').contains('Suggest an Edit').click();
          cy.recordAudio();
          cy.recordAudio('NSA');
          cy.get('button[type="submit"]').click();

          cy.wait('@createWordWithWordSuggestion').then(({ response: newWordSuggestionResponse }) => {
            expect(newWordSuggestionResponse.body.pronunciation)
              .to.equal(`${awsUriPrefix}${newWordSuggestionResponse.body.id}`);
            expect(newWordSuggestionResponse.body.dialects.NSA.pronunciation)
              .to.equal(`${awsUriPrefix}${newWordSuggestionResponse.body.id}-NSA`);
          });
        });
      });
    });

    it('merge audio headword and dialect audio pronunciations for a new word', () => {
      cy.intercept('PUT', '**/wordSuggestions/**', (req) => {
        req.alias = 'putWordSuggestion';
        req.body.pronunciation = req.body.id;
        req.body.dialects.NSA.pronunciation = req.body.id;
      }).as('putWordSuggestion');
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.findByTestId('word-class-input-container').click();
      cy.findAllByText(WordClassOptions.CJN.label).click({ force: true, multiple: true });
      cy.intercept('GET', '**/wordSuggestions/**').as('getWordSuggestion');
      cy.recordAudio();
      cy.recordAudio('NSA');
      cy.get('button[type="submit"]').click();
      cy.wait('@putWordSuggestion');
      cy.wait('@getWordSuggestion').then(({ response: getWordSuggestionResponse }) => {
        expect(getWordSuggestionResponse.body.pronunciation)
          .to.equal(`${awsUriPrefix}${getWordSuggestionResponse.body.id}`);
        expect(getWordSuggestionResponse.body.dialects.NSA.pronunciation)
          .to.equal(`${awsUriPrefix}${getWordSuggestionResponse.body.id}-NSA`);

        cy.intercept('GET', '**/words/**').as('getWord');
        cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
        cy.acceptConfirmation();
        cy.wait('@getWord').then(({ response: postWordResponse }) => {
          expect(postWordResponse.body.pronunciation)
            .to.equal(`${awsUriPrefix}${postWordResponse.body.id}`);
          expect(postWordResponse.body.dialects.NSA.pronunciation)
            .to.equal(`${awsUriPrefix}${postWordResponse.body.id}-NSA`);
        });
      });
    });

    it('save audio headword and dialect pronunciations for word suggestion', () => {
      cy.intercept('PUT', '**/wordSuggestions/**', (req) => {
        req.alias = 'putWordSuggestion';
        req.body.pronunciation = req.body.id;
        req.body.dialects.NSA.pronunciation = req.body.id;
      }).as('putWordSuggestion');
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.findByTestId('word-class-input-container').click();
      cy.findAllByText(WordClassOptions.CJN.label).click({ force: true, multiple: true });
      cy.intercept('GET', '**/wordSuggestions/**').as('getWordSuggestion');
      cy.recordAudio();
      cy.recordAudio('NSA');
      cy.get('button[type="submit"]').click();
      cy.wait('@putWordSuggestion');
      cy.wait('@getWordSuggestion').then(({ response }) => {
        expect(response.body.pronunciation)
          .to.equal(`${awsUriPrefix}${response.body.id}`);
        expect(response.body.dialects.NSA.pronunciation)
          .to.equal(`${awsUriPrefix}${response.body.id}-NSA`);
      });
    });

    it('reset audio headword pronunciation for word suggestion', () => {
      cy.intercept('PUT', '**/wordSuggestions/**', (req) => {
        req.alias = 'putWordSuggestion';
        req.body.pronunciation = req.body.id;
        req.body.dialects.NSA.pronunciation = req.body.id;
      }).as('putWordSuggestion');
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.findByTestId('word-class-input-container').click();
      cy.findAllByText(WordClassOptions.CJN.label).click({ force: true, multiple: true });
      cy.intercept('GET', '**/wordSuggestions/**').as('getWordSuggestion');
      cy.recordAudio();
      cy.recordAudio('NSA');
      cy.get('button[type="submit"]').click();
      cy.wait('@putWordSuggestion');
      cy.wait('@getWordSuggestion').then(({ response }) => {
        expect(response.body.pronunciation)
          .to.equal(`${awsUriPrefix}${response.body.id}`);
        expect(response.body.dialects.NSA.pronunciation)
          .to.equal(`${awsUriPrefix}${response.body.id}-NSA`);
      });
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.recordAudio();
      cy.findAllByRole('button', { name: 'Reset Recording' }).first().click();
      cy.findByText('Reset Audio Pronunciation');
    });
  });

  describe('Word Edit', () => {
    beforeEach(() => {
      cy.cleanLogin();
    });
    it('render the edit view for word suggestions', () => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.findAllByText('Word');
      cy.findAllByText('Part of Speech');
      cy.findAllByText('Definitions');
    });

    it('render the same amount of nested examples', () => {
      const word = uuidv4();
      const definition = 'first definition';
      const firstIgboSentence = 'first igbo sentence';
      const firstEnglishSentence = 'first english sentence';
      cy.intercept('POST', '**/words').as('mergeWord');
      cy.get('a[href="#/wordSuggestions"]').click();
      cy.get('button').contains('Create').click();
      cy.findByTestId('word-input').type(word);
      cy.findByTestId('word-class-input-container').click();
      cy.findByText(WordClassOptions.PRN.label).click();
      cy.findByTestId('definitions-0-input').type(definition);
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
      cy.get('button[type="submit"]').click();
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
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        cy.get('label[data-test="isStandardIgbo-checkbox"]').find('input[checked]');
      });
    });

    it('render the same data for dialects', () => {
      cy.selectCollection('wordSuggestions');
      cy.createWordSuggestion().then((word) => {
        cy.searchForDocument(word);
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        cy.findByTestId('dialects-NSA-word-input').clear().type('this is a dialect');
        cy.get('button[type="submit"]').click();
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        cy.findByTestId('dialects-NSA-word-input').should('have.value', 'this is a dialect');
      });
    });

    it('toggle between different dialect views', () => {
      cy.selectCollection('wordSuggestions');
      cy.createWordSuggestion().then((word) => {
        cy.searchForDocument(word);
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        cy.recordAudio();
        cy.findAllByTestId('dialect-move-menu').first().click();
        cy.wait(300);
        cy.findByRole('menu').contains('Nsa').click();
        cy.acceptConfirmation();
        cy.findByTestId('dialects-NSA-word-input').clear().type('this is a dialect');
        cy.findAllByTestId('dialect-views-menu').first().click();
        cy.wait(300);
        cy.findByRole('menu').contains('Afikpo').click();
        cy.findByRole('menu').contains('Nsa').click();
        cy.findByTestId('dialects-NSA-word-input').should('have.value', 'this is a dialect');
        cy.get('button[type="submit"]').click();
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        cy.findByTestId('dialects-NSA-word-input').should('have.value', 'this is a dialect');
      });
    });

    it('render the same data between the string and array views for definitions', () => {
      const firstDefinition = 'first definition';
      const secondDefinition = 'second definition';
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.findByTestId('definitions-0-input').clear().type(firstDefinition);
      cy.findByText('Add Definition').click();
      cy.findByTestId('definitions-1-input').clear().type(secondDefinition);
      cy.get('textarea').contains(secondDefinition);
      cy.get('button[type="submit"]').click();
      cy.get('[data-test*="definition-"]').then((definitions) => {
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
      cy.findByTestId('definitions-0-input').type(definition);
      cy.findByLabelText('Add Example').click();
      cy.findByTestId('examples-0-igbo-input').clear().type(firstIgboSentence);
      cy.findByTestId('examples-0-english-input').clear().type(firstEnglishSentence);
      cy.get('button[type="submit"]').click();
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
      cy.findByText(`${firstIgboSentence}${extraText}`);
      cy.getActionsOption(SuggestionSelectOptions.MERGE).click();
      cy.acceptConfirmation();
      cy.contains('Word Document Details');
      cy.findByText(`${firstIgboSentence}${extraText}`);
    });
  });

  describe('Edit Form', () => {
    it.skip('render the edit view for generic words', () => {
      cy.get('a[href="#/genericWords').click();
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.get('h1').contains('Word');
      cy.get('h1').contains('Part of Speech');
      cy.get('h1').contains('Definitions');
    });

    it('render the edit view for example suggestions', () => {
      cy.createExampleSuggestion();
      cy.get('a[href="#/exampleSuggestions').click();
      cy.getActionsOption(SuggestionSelectOptions.VIEW).click();
      cy.get('h1').contains('Igbo');
      cy.get('h1').contains('English');
      cy.get('h1').contains('Associated Word Ids');
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

  // TODO: #137 Consider sunsetting this feature
  describe.skip('Caching Form Data', () => {
    before(() => {
      cy.cleanLogin('merger@example.com', { role: 'merger' });
    });

    it('save word form data with localStorage while typing', () => {
      const newWord = 'NEW WORD';
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.findByTestId('word-input').clear().type(newWord);
      cy.findByTestId('word-class-input-container').click();
      cy.findByTestId('dialects-NSA-word-input').clear().type('NSA word dialect');
      cy.findByText(WordClassOptions.ADJ.label).click().then(() => {
        // Checks for latest data from localStorage
        let formData = JSON.parse(localStorage.getItem('igbo-api-admin-form')) || {};
        expect(formData.word).to.equal(newWord);
        expect(formData.wordClass).to.equal(WordClassOptions.ADJ.value);
        cy.reload(true);
        // Checks again after page reload
        formData = JSON.parse(localStorage.getItem('igbo-api-admin-form')) || {};
        expect(formData.word).to.equal(newWord);
        expect(formData.wordClass).to.equal(WordClassOptions.ADJ.value);
        cy.findByTestId('word-input').should('have.value', newWord);
        cy.get('input[name="wordClass"]').should('have.value', WordClassOptions.ADJ.value);
        // Checks to see if data from localStorage is still getting used
        cy.selectCollection('wordSuggestions');
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        cy.findByTestId('word-input').should('have.value', newWord);
        cy.get('input[name="wordClass"]').should('have.value', WordClassOptions.ADJ.value);
        cy.findByTestId('dialects-NSA-word-input').should('have.value', 'NSA word dialect');
      });
    });

    it('doesn\'t pre-populate suggest new word edit form from localStorage', () => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click().then(() => {
        // Checks for latest data from localStorage
        const { word, wordClass } = JSON.parse(localStorage.getItem('igbo-api-admin-form')) || {};
        cy.selectCollection('words');
        cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
        cy.findByTestId('word-input').should('not.have.value', word);
        cy.get('input[name="wordClass"]').should('not.have.value', wordClass);
      });
    });

    it('doesn\'t pre-populate suggest new wordSuggesiton form with localStorage', () => {
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click().then(() => {
        // Checks for latest data from localStorage
        const { word, wordClass } = JSON.parse(localStorage.getItem('igbo-api-admin-form')) || {};
        cy.selectCollection('wordSuggestions');
        cy.visit('#/wordSuggestions/create');
        cy.findByTestId('word-input').should('not.have.value', word);
        cy.get('input[name="wordClass"]').should('not.have.value', wordClass);
      });
    });

    it('save word form data with localStorage while typing and clears by pressing cancel', () => {
      const newWord = 'NEW WORD';
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.findByTestId('word-input').clear().type(newWord);
      cy.findByTestId('word-class-input-container').click();
      cy.findAllByText(WordClassOptions.WH.label).first().click().then(() => {
        // Checks for latest data from localStorage
        const formData = JSON.parse(localStorage.getItem('igbo-api-admin-form')) || {};
        expect(formData.word).to.equal(newWord);
        expect(formData.wordClass).to.equal(WordClassOptions.WH.value);
        cy.get('button').contains('Cancel').click();
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        // Checks to see if data from localStorage isn't getting used
        cy.selectCollection('wordSuggestions');
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        cy.findByTestId('word-input').should('have.not.value', newWord);
        cy.get('input[name="wordClass"]').should('have.not.value', WordClassOptions.WH.value);
      });
    });

    it('save word form data with localStorage while typing and clears by pressing update', () => {
      const newWord = 'NEW WORD';
      cy.createWordSuggestion();
      cy.selectCollection('wordSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.findByTestId('word-input').clear().type(newWord);
      cy.findByTestId('word-class-input-container').click();
      cy.get('div[tabindex="-1"]').contains(WordClassOptions.ADV.label).click().then(() => {
        // Checks for latest data from localStorage
        const formData = JSON.parse(localStorage.getItem('igbo-api-admin-form')) || {};
        expect(formData.word).to.equal(newWord);
        expect(formData.wordClass).to.equal(WordClassOptions.ADV.value);
        cy.get('button[type="submit"]').click();
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        // Checks to see if data from localStorage isn't getting used
        cy.selectCollection('wordSuggestions');
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        cy.findByTestId('word-input').should('have.not.value', newWord);
        cy.get('input[name="wordClass"]').should('have.not.value', WordClassOptions.ADV.value);
      });
    });

    it('save example form data from localStorage while typing', () => {
      const igboInput = 'IGBO INPUT';
      const englishInput = 'ENGLISH INPUT';
      cy.createExampleSuggestion();
      cy.selectCollection('exampleSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.findByTestId('igbo-input').clear().type(igboInput);
      cy.findByTestId('english-input').clear().type(englishInput).then(() => {
        // Checks for latest data from localStorage
        let formData = JSON.parse(localStorage.getItem('igbo-api-admin-form')) || {};
        expect(formData.igbo).to.equal(igboInput);
        expect(formData.english).to.equal(englishInput);
        cy.reload(true);
        // Checks again after page reload
        formData = JSON.parse(localStorage.getItem('igbo-api-admin-form')) || {};
        expect(formData.igbo).to.equal(igboInput);
        expect(formData.english).to.equal(englishInput);
        cy.findByTestId('igbo-input').should('have.value', igboInput);
        cy.findByTestId('english-input').should('have.value', englishInput);
        // Checks to see if data from localStorage is still getting used
        cy.selectCollection('exampleSuggestions');
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        cy.findByTestId('igbo-input').should('have.value', igboInput);
        cy.findByTestId('english-input').should('have.value', englishInput);
      });
    });

    it('save example form data from localStorage while typing and clears by pressing cancel', () => {
      const igboInput = 'IGBO INPUT';
      const englishInput = 'ENGLISH INPUT';
      cy.createExampleSuggestion();
      cy.selectCollection('exampleSuggestions');
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
      cy.findByTestId('igbo-input').clear().type(igboInput);
      cy.findByTestId('english-input').clear().type(englishInput).then(() => {
        // Checks for latest data from localStorage
        const formData = JSON.parse(localStorage.getItem('igbo-api-admin-form')) || {};
        expect(formData.igbo).to.equal(igboInput);
        expect(formData.english).to.equal(englishInput);
        cy.get('button').contains('Cancel').click();
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        // Checks to see if data isn't getting used
        cy.selectCollection('exampleSuggestions');
        cy.getActionsOption(SuggestionSelectOptions.EDIT).click();
        cy.findByTestId('igbo-input').should('have.not.value', igboInput);
        cy.findByTestId('english-input').should('have.not.value', englishInput);
      });
    });

    it('doesn\'t pre-populate suggest new example edit form from localStorage', () => {
      cy.selectCollection('exampleSuggestions');
      cy.createExampleSuggestion();
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click().then(() => {
        // Checks for latest data from localStorage
        const { igbo, english } = JSON.parse(localStorage.getItem('igbo-api-admin-form')) || {};
        cy.selectCollection('examples');
        cy.getActionsOption(DocumentSelectOptions.SUGGEST_NEW_EDIT).click();
        cy.findByTestId('igbo-input').should('not.have.value', igbo);
        cy.findByTestId('english-input').should('not.have.value', english);
      });
    });

    it('doesn\'t pre-populate suggest new exampleSuggestion form from localStorage', () => {
      cy.selectCollection('exampleSuggestions');
      cy.createExampleSuggestion();
      cy.getActionsOption(SuggestionSelectOptions.EDIT).click().then(() => {
        // Checks for latest data from localStorage
        const { igbo, english } = JSON.parse(localStorage.getItem('igbo-api-admin-form')) || {};
        cy.selectCollection('exampleSuggestions');
        cy.visit('#/wordSuggestions/create');
        cy.findByTestId('igbo-input').should('not.have.value', igbo);
        cy.findByTestId('english-input').should('not.have.value', english);
      });
    });
  });
});
