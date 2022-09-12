// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import '@testing-library/cypress/add-commands';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';
import 'cypress-localstorage-commands';
import { times } from 'lodash';
import { attachCustomCommands } from 'cypress-firebase';
import { STAGING_FIREBASE_CONFIG } from '../../src/config';
import { API_ROUTE, wordSuggestionData, exampleSuggestionData } from '../constants';

firebase.initializeApp(STAGING_FIREBASE_CONFIG);

attachCustomCommands({ Cypress, cy, firebase });

Cypress.on('window:before:load', (window) => {
  // eslint-disable-next-line
  window.setImmediate = window.setTimeout;
});

Cypress.Commands.add('typeLogin', (email, password) => {
  cy.visit('http://localhost:3030/#/login');
  cy.intercept('POST', '**/identitytoolkit/v3/relyingparty/verifyPassword**').as('loggingIn');
  cy.contains('Sign in with email').click();
  cy.get('input[type="email"]').clear().type(email);
  cy.findByRole('button', { name: 'Next' }).click();
  cy.get('input[type="password"]').clear().type(password);
  cy.findByRole('button', { name: 'Sign In' }).click();
  cy.wait('@loggingIn');
  cy.wait(2000); // Wait for localStorage to get populated
  cy.saveLocalStorage();
});

Cypress.Commands.add('cleanLogin', (email, password) => {
  const loginEmail = email || 'admin@example.com';
  const loginPassword = 'password' || password;
  times(3, () => cy.clearLocalStorage());
  cy.logout();
  cy.visit('/');
  cy.typeLogin(loginEmail, loginPassword);
});

Cypress.Commands.add('tempLogin', (uid = 'admin@example.com', customClaims = { role: 'admin' }) => {
  cy.login(uid, customClaims);
  cy.visit('/#/words');
});

/*
 * This command exposes the following elements from a word document
 *
 * @selectedReviewedIcon
 * @selectedWord
 * @selectedApprovals
 * @selectedDenials
 * @selectedId
 */
Cypress.Commands.add('getWordSuggestionDocumentDetails', (position = 1) => {
  cy.window().then((win) => {
    const localStoragePermission = win.localStorage.getItem('igbo-api-admin-permissions');
    const isAdminOrMerger = localStoragePermission === 'admin' || localStoragePermission === 'merger';
    const docPosition = position;
    const WORD_COLUMN = isAdminOrMerger ? 3 : 0;
    const ID_COLUMN = 6;
    cy
      .findAllByTestId('review-cell')
      .eq(docPosition - 1) // Needs to start at 0 to grab the first review-cell
      .as('selectedReviewedIcon');
    cy
      .get('tr')
      .eq(docPosition)
      .find('td span[class*="Mui"]')
      .eq(WORD_COLUMN)
      .as('selectedWord');
    cy
      .findAllByTestId('approval') // Needs to start at 0 to grab the first approval
      .eq(docPosition - 1)
      .as('selectedApprovals');
    cy
      .findAllByTestId('denial') // Needs to start at 0 to grab the first denial
      .eq(docPosition - 1)
      .as('selectedDenials');
    cy
      .get('tr')
      .eq(docPosition)
      .find('td span')
      .eq(ID_COLUMN)
      .as('selectedId');
  });
});

/*
 * This command exposes the following elements from a word suggestion document
 *
 * @selectedName
 * @selectedEmail
 * @selectedRole
 * @selectedEditingGroup
 * @selectedId
 */
Cypress.Commands.add('getUserDocumentDetails', (position = 1) => {
  const docPosition = position;
  const EMAIL_COLUMN = 0;
  const ROLE_COLUMN = 1;
  const EDITING_GROUP_COLUMN = 2;
  const ID_COLUMN = 3;

  cy
    .get('tr')
    .eq(docPosition)
    .find('td span')
    .eq(EMAIL_COLUMN)
    .as('selectedEmail');
  cy
    .get('tr')
    .eq(docPosition)
    .find('td span')
    .eq(ROLE_COLUMN)
    .as('selectedRole');
  cy
    .get('tr')
    .eq(docPosition)
    .find('td span')
    .eq(EDITING_GROUP_COLUMN)
    .as('selectedEditingGroup');

  cy
    .get('tr')
    .eq(docPosition)
    .find('td span')
    .eq(ID_COLUMN)
    .as('selectedId');
});

/*
 * This command exposes the following elements from a word document
 *
 * @selectedWord
 * @selectedPartOfSpeech
 * @selectedDefinitions
 * @selectedVariations
 * @selectedStems
 * @selectedId
 */
Cypress.Commands.add('getWordDetails', (docPosition = 1) => {
  cy.get('.column-word').eq(docPosition).find('span').as('selectedWord');
  cy.get('.column-wordClass').eq(docPosition).find('span').as('selectedPartOfSpeech');
  cy.findAllByTestId('definitions-preview').eq(docPosition).as('selectedDefinitions');
  cy.findAllByTestId('variations-preview').eq(docPosition).as('selectedVariations');
  cy.findAllByTestId('stems-preview').eq(docPosition).as('selectedStems');
  cy.get('.column-id').eq(docPosition).find('span').as('selectedId');
});

/*
 * This command exposes the following elements from an example suggestion document
 *
 * @selectedReviewedIcon
 * @selectedIgbo
 * @selectedEnglish
 * @selectedApprovals
 * @selectedDenials
 * @selectedId
 */
Cypress.Commands.add('getExampleSuggestionDocumentDetails', (position = 1) => {
  const docPosition = position;
  const ALREADY_REVIEWED_ICON_COLUMN = 0;
  const IGBO_COLUMN = 0;
  const ENGLISH_COLUMN = 1;
  const APPROVALS_COLUMN = 3;
  const DENIALS_COLUMN = 4;
  const ID_COLUMN = 5;
  cy
    .get('tr')
    .eq(docPosition)
    .find('td div')
    .eq(ALREADY_REVIEWED_ICON_COLUMN)
    .as('selectedReviewedIcon');
  cy
    .get('tr')
    .eq(docPosition)
    .find('td span')
    .eq(IGBO_COLUMN)
    .as('selectedIgbo');
  cy
    .get('tr')
    .eq(docPosition)
    .find('td span')
    .eq(ENGLISH_COLUMN)
    .as('selectedEnglish');
  cy
    .get('tr')
    .eq(docPosition)
    .find('td span')
    .eq(APPROVALS_COLUMN)
    .as('selectedApprovals');
  cy
    .get('tr')
    .eq(docPosition)
    .find('td span')
    .eq(DENIALS_COLUMN)
    .as('selectedDenials');
  cy
    .get('tr')
    .eq(docPosition)
    .find('td span')
    .eq(ID_COLUMN)
    .as('selectedId');
});

/*
 * This command exposes the following elements from an example document
 *
 * @selectedIgbo
 * @selectedEnglish
 * @selectedAssociatedWordsIds
 * @selectedId
 */
Cypress.Commands.add('getExampleDetails', (position = 1) => {
  const docPosition = position;
  const IGBO_COLUMN = 0;
  const ENGLISH_COLUMN = 1;
  const ASSOCIATED_WORDS_IDS_COLUMN = 2;
  const ID_COLUMN = 3;
  cy
    .get('tr')
    .eq(docPosition)
    .find('td span')
    .eq(IGBO_COLUMN)
    .as('selectedIgbo');
  cy
    .get('tr')
    .eq(docPosition)
    .find('td span')
    .eq(ENGLISH_COLUMN)
    .as('selectedEnglish');
  cy
    .get('tr')
    .eq(docPosition)
    .find('td span')
    .eq(ASSOCIATED_WORDS_IDS_COLUMN)
    .as('selectedAssociatedWordsIds');
  cy
    .get('tr')
    .eq(docPosition)
    .find('td span')
    .eq(ID_COLUMN)
    .as('selectedId');
});

/* Grabs the editor's action dropdown for the first document in the list */
// Alternative query: https://github.com/cypress-io/cypress/issues/549#issuecomment-523399928
Cypress.Commands.add('getActionsOption', (optionText, position = 0) => {
  cy.get('.test-select-options').should('be.visible').as('editorActions');
  cy.get('@editorActions')
    .findByText('Action')
    .eq(position)
    .scrollIntoView()
    .parent()
    .find('input')
    .click({ force: true });
  return cy.get('.test-select-options [id|=react-select][tabindex]').contains(optionText);
});

/* Presses the confirm option in the confirmation modal */
Cypress.Commands.add('acceptConfirmation', () => {
  cy.findByTestId('confirmation-confirm-button').click();
  cy.findByRole('alertdialog').should('not.exist');
});

/* Presses the cancel option in the confirmation modal */
Cypress.Commands.add('cancelConfirmation', () => {
  cy.findByTestId('confirmation-cancel-button').click();
});

/* Checks for React Admin's red error message */
Cypress.Commands.add('checkForErrorMessage', () => {
  cy.get('div').contains(/^Error:/, { timeout: 1000 }).should('not.exist');
  cy.get('div[class*="RaNotification-warning-"]').should('not.exist');
});

/* Records a new audio recording for a specified headword or dialect */
Cypress.Commands.add('recordAudio', (dialect = '') => {
  cy.findByTestId(`start-recording-button${dialect ? `-${dialect}` : ''}`).click();
  cy.wait(1000);
  cy.findByTestId(`stop-recording-button${dialect ? `-${dialect}` : ''}`).click();
});

/* Uses the search bar to search for a selected collection document */
Cypress.Commands.add('searchForDocument', (keyword) => {
  cy.intercept('GET', '**/**?filter=**').as('searchingDocuments');
  cy.findByTestId('search-bar').then(([searchBar]) => {
    cy.wait(2000);
    if (!keyword) {
      cy.wrap(searchBar).clear();
      cy.wait(500);
    } else {
      cy.wrap(searchBar).clear().type(keyword);
      cy.wait('@searchingDocuments');
      cy.wait(500);
      // Looks for the result document in the list
      cy.get('td').find('span').contains(keyword);
    }
  });
});

/* Makes a network request to make a new wordSuggestion */
Cypress.Commands.add('createWordSuggestion', (data = {}) => {
  const word = uuidv4();
  cy.request({
    method: 'POST',
    url: `${API_ROUTE}/wordSuggestions`,
    auth: {
      bearer: localStorage.getItem('igbo-api-admin-access'),
    },
    body: {
      ...wordSuggestionData,
      word,
      ...data,
    },
  }).its('status').should('eq', 200);
  return cy.wrap(word);
});

/* Makes a network request to make a new exampleSuggestion */
Cypress.Commands.add('createExampleSuggestion', () => {
  cy.request({
    method: 'POST',
    url: `${API_ROUTE}/exampleSuggestions`,
    auth: {
      bearer: localStorage.getItem('igbo-api-admin-access'),
    },
    body: { ...exampleSuggestionData, igbo: uuidv4(), english: uuidv4() },
  }).its('status').should('eq', 200);
});

Cypress.Commands.add('selectCollection', (collection, overrideWait = false) => {
  if (!collection) {
    throw new Error('\'collection\' must have a value');
  };
  cy.window().then((appWindow) => {
    cy.intercept('GET', `**/${collection}**`).as('getCollectionDocuments');
    const waitForResponse = appWindow.location.hash !== `#/${collection}` && !overrideWait;
    cy.get(`a[href="#/${collection}"]`).scrollIntoView().click({ force: true });
    if (waitForResponse) {
      cy.wait('@getCollectionDocuments');
    }
  });
});

Cypress.Commands.add('seedDatabase', () => {
  const API_ROUTE = 'http://localhost:8080/api/v1';
  const SITE_ROUTE = '/';
  cy.request({
    method: 'GET',
    url: `${API_ROUTE}/words`,
    headers: {
      'X-API-Key': 'main_key',
    },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status >= 400 || !response.body.length || response.body.error) {
      cy.request({
        method: 'POST',
        url: `${API_ROUTE}/test/populate`,
        headers: {
          'X-API-Key': 'main_key',
        },
        failOnStatusCode: false,
        timeout: 45000,
      });
    }
  });
});
