/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
import mongoose from 'mongoose';
import { Request } from '@types/superagent';
import chai from 'chai';
import chaiHttp from 'chai-http';
import createRegExp from 'src/backend/shared/utils/createRegExp';
import { resultsFromDictionarySearch } from 'src/backend/services/words';
import { sendEmail } from 'src/backend/controllers/email';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import './script';
import { app as expressServer } from '../../../index';
import {
  API_KEY,
  API_URL,
  AUTH_TOKEN,
  ORIGIN_HEADER,
  LOCAL_ROUTE,
  TEST_ROUTE,
} from './constants';
import mockedData from '../__mocks__/data_mock';

chai.use(chaiHttp);
/* Necessary to work with Typescript */
const chaiServer = chai.request(expressServer).keepOpen();

export const closeServer = (): ChaiHttp.Agent => (
  chaiServer
    .close()
);

export const getWordSuggestions = (query = {}, options = { token: '' }): Request => (
  chaiServer
    .get('/wordSuggestions')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const getWordSuggestion = (id: mongoose.Types.ObjectId | string, options = { token: '' }): Request => (
  chaiServer
    .get(`/wordSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const deleteWordSuggestion = (id: string, options = { token: '' }): Request => (
  chaiServer
    .delete(`/wordSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const getExampleSuggestions = (query = {}, options = { token: '' }): Request => (
  chaiServer
    .get('/exampleSuggestions')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const getExampleSuggestion = (id: string, options = { token: '' }): Request => (
  chaiServer
    .get(`/exampleSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const deleteExampleSuggestion = (id: string, options = { token: '' }): Request => (
  chaiServer
    .delete(`/exampleSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const getCorpusSuggestions = (query = {}, options = { token: '' }): Request => (
  chaiServer
    .get('/corpusSuggestions')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const getPolls = (query = {}, options = { token: '' }): Request => (
  chaiServer
    .get('/polls')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const deleteCorpusSuggestion = (id: string, options = { token: '' }): Request => (
  chaiServer
    .delete(`/corpusSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const createWord = (id: string, query = {}, options = { token: '' }): Request => (
  chaiServer
    .post('/words')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .send({ id })
);

export const deleteWord = (id: string, primaryWordId: string, options = { token: '' }): Request => (
  chaiServer
    .delete(`/words/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .send({ primaryWordId })
);

export const createExample = (id: string, query = {}, options = { token: '' }): Request => (
  chaiServer
    .post('/examples')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .send({ id })
);

export const createCorpus = (id: string, query = {}, options = { token: '' }): Request => (
  chaiServer
    .post('/corpus')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .send({ id })
);
export const createPoll = (id: string, query = {}, options = { token: '' }): Request => (
  chaiServer
    .post('/corpus')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .send({ id })
);

export const suggestNewWord = (data: any, options = { token: '' }): Request => (
  chaiServer
    .post('/wordSuggestions')
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const suggestNewExample = (data: any, options = { token: '' }): Request => (
  chaiServer
    .post('/exampleSuggestions')
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const updateWordSuggestion = (data: any, options = { token: '' }): Request => (
  chaiServer
    .put(`/wordSuggestions/${data.id}`)
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const updateExampleSuggestion = (data: any, options = { token: '' }): Request => (
  chaiServer
    .put(`/exampleSuggestions/${data.id}`)
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const updateWord = (data: any, options = { token: '' }): Request => (
  chaiServer
    .put(`/words/${data.id}`)
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const updateExample = (data: any, options = { token: '' }): Request => (
  chaiServer
    .put(`/examples/${data.id}`)
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

export const approveWordSuggestion = (data: any): Request => {
  const approvedData = data;
  approvedData.approvals.push('approval');
  return updateWordSuggestion({ id: data.id, ...data });
};

export const approveExampleSuggestion = (data: any): Request => {
  const approvedData = data;
  approvedData.approvals.push('approval');
  return updateExampleSuggestion({ id: data.id, ...data });
};

/* Searches for words using the data in MongoDB */
export const getWords = (query = {}, options = { token: '', apiKey: '', origin: '' }): Request => (
  chaiServer
    .get('/words')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER)
);

/* Searches for examples using the data in MongoDB */
export const getExamples = (query = {}, options = { token: '', apiKey: '', origin: '' }): Request => (
  chaiServer
    .get('/examples')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER)
);

export const getWord = (id: string, query = {}, options = { apiKey: '', origin: '' }): Request => (
  chaiServer
    .get(`/words/${id}`)
    .query(query)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER)
);

export const getExample = (id: string, query = {}, options = { apiKey: '', origin: '' }): Request => (
  chaiServer
    .get(`/examples/${id}`)
    .query(query)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER)
);

/* Mocks grabbing all users from Firebase */
export const getUsers = (options = { token: '' }): Request => (
  chaiServer
    .get('/users')
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
);

/* Hits the POST /populate route to seed the local MongoDB database */
export const populateAPI = (): Request => (
  chaiServer
    .post(`${TEST_ROUTE}/populate`)
);

export const getAPIUrlRoute = (route = LOCAL_ROUTE): Request => (
  chai
    .request(API_URL)
    .get(route)
);

export const getLocalUrlRoute = (route = LOCAL_ROUTE): Request => (
  chaiServer
    .get(route)
);

/* Sends an email to all editors, mergers, and admins about
 * merged words and examples.
 */
export const sendEmailJob = (): Request => (
  chaiServer
    .post(`${TEST_ROUTE}/email/mergedStats`)
);

/* Uses data in __mocks__ folder */
export const searchMockedTerm = (term: string): any => {
  const { wordReg: searchRegex } = createRegExp(term);
  return resultsFromDictionarySearch(searchRegex, mockedData);
};

export const sendSendGridEmail = (message: Interfaces.ConstructedMessage): Request => sendEmail(message);
