/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
import chai from 'chai';
import chaiHttp from 'chai-http';
import * as app from '../../../functions/index';
import {
  API_KEY,
  API_URL,
  AUTH_TOKEN,
  ORIGIN_HEADER,
  LOCAL_ROUTE,
  TEST_ROUTE,
} from './constants';
import createRegExp from '../../backend/shared/utils/createRegExp';
import { resultsFromDictionarySearch } from '../../backend/services/words';
import { sendEmail } from '../../backend/controllers/email';
import mockedData from '../__mocks__/data_mock';

chai.use(chaiHttp);
/* Necessary to work with Typescript */
const { app: server } = app;
const chaiServer = chai.request(server).keepOpen();

export const closeServer = () => (
  chaiServer
    .close()
);

export const getWordSuggestions = (query = {}, options = { token: '' }) => (
  chaiServer
    .get('/wordSuggestions')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const getWordSuggestion = (id, options = { token: '' }) => (
  chaiServer
    .get(`/wordSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const deleteWordSuggestion = (id, options = { token: '' }) => (
  chaiServer
    .delete(`/wordSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const getExampleSuggestions = (query = {}, options = { token: '' }) => (
  chaiServer
    .get('/exampleSuggestions')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const getExampleSuggestion = (id, options = { token: '' }) => (
  chaiServer
    .get(`/exampleSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const deleteExampleSuggestion = (id, options = { token: '' }) => (
  chaiServer
    .delete(`/exampleSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const getGenericWords = (query = {}, options = { token: '', apiKey: '', origin: '' }) => (
  chaiServer
    .get('/genericWords')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER)
);

export const getGenericWord = (id, options = { token: '' }) => (
  chaiServer
    .get(`/genericWords/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const deleteGenericWord = (id, options = { token: '' }) => (
  chaiServer
    .delete(`/genericWords/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const createWord = (id, query = {}, options = { token: '' }) => (
  chaiServer
    .post('/words')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .send({ id })
);

export const deleteWord = (id, primaryWordId, options = { token: '' }) => (
  chaiServer
    .delete(`/words/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .send({ primaryWordId })
);

export const createExample = (id, query = {}, options = { token: '' }) => (
  chaiServer
    .post('/examples')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .send({ id })
);

export const suggestNewWord = (data, options = { token: '' }) => (
  chaiServer
    .post('/wordSuggestions')
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const suggestNewExample = (data, options = { token: '' }) => (
  chaiServer
    .post('/exampleSuggestions')
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const updateWordSuggestion = (data, options = { token: '' }) => (
  chaiServer
    .put(`/wordSuggestions/${data.id}`)
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const updateExampleSuggestion = (data, options = { token: '' }) => (
  chaiServer
    .put(`/exampleSuggestions/${data.id}`)
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const updateGenericWord = (data, options = { token: '' }) => (
  chaiServer
    .put(`/genericWords/${data.id}`)
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const updateWord = (data, options = { token: '' }) => (
  chaiServer
    .put(`/words/${data.id}`)
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const updateExample = (data, options = { token: '' }) => (
  chaiServer
    .put(`/examples/${data.id}`)
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const approveWordSuggestion = (data) => {
  const approvedData = data;
  approvedData.approvals.push('approval');
  return updateWordSuggestion({ id: data.id, ...data });
};

export const approveExampleSuggestion = (data) => {
  const approvedData = data;
  approvedData.approvals.push('approval');
  return updateExampleSuggestion({ id: data.id, ...data });
};

export const approveGenericWord = (data) => {
  const approvedData = data;
  approvedData.approvals.push('approval');
  return updateGenericWord({ id: data.id, ...data });
};

/* Searches for words using the data in MongoDB */
export const getWords = (query = {}, options = { token: '', apiKey: '', origin: '' }) => (
  chaiServer
    .get('/words')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER)
);

/* Searches for examples using the data in MongoDB */
export const getExamples = (query = {}, options = { token: '', apiKey: '', origin: '' }) => (
  chaiServer
    .get('/examples')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER)
);

export const getWord = (id, query = {}, options = { apiKey: '', origin: '' }) => (
  chaiServer
    .get(`/words/${id}`)
    .query(query)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER)
);

export const getExample = (id, query = {}, options = { apiKey: '', origin: '' }) => (
  chaiServer
    .get(`/examples/${id}`)
    .query(query)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER)
);

/* Mocks grabbing all users from Firebase */
export const getUsers = (options = { token: '' }) => (
  chaiServer
    .get('/users')
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

/* Hits the POST /populate route to seed the local MongoDB database */
export const populateAPI = () => (
  chaiServer
    .post(`${TEST_ROUTE}/populate`)
);

export const populateGenericWordsAPI = () => (
  chaiServer
    .post(`${TEST_ROUTE}/genericWords`)
);

/* Uses data in JSON */
export const searchTerm = (term) => (
  chaiServer
    .get(`${TEST_ROUTE}/words`)
    .query({ keyword: term })
);

export const getAPIUrlRoute = (route = LOCAL_ROUTE) => (
  chai
    .request(API_URL)
    .get(route)
);

export const getLocalUrlRoute = (route = LOCAL_ROUTE) => (
  chaiServer
    .get(route)
);

/* Sends an email to all editors, mergers, and admins about
 * merged words and examples.
 */
export const sendEmailJob = () => (
  chaiServer
    .post(`${TEST_ROUTE}/email/mergedStats`)
);

/* Uses data in __mocks__ folder */
export const searchMockedTerm = (term) => {
  const regexTerm = createRegExp(term);
  return resultsFromDictionarySearch(regexTerm, term, mockedData);
};

export const sendSendGridEmail = (message) => sendEmail(message);
