/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
import mongoose from 'mongoose';
// @ts-expect-error @types/superagent
import { Request } from '@types/superagent';
import chai from 'chai';
import chaiHttp from 'chai-http';
import createRegExp from 'src/backend/shared/utils/createRegExp';
import { resultsFromDictionarySearch } from 'src/backend/services/words';
import { sendEmail } from 'src/backend/controllers/email';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import removePayloadFields from 'src/shared/utils/removePayloadFields';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import './script';
import { app as expressServer } from '../../../index';
import { API_KEY, API_URL, AUTH_TOKEN, ORIGIN_HEADER, LOCAL_ROUTE, TEST_ROUTE } from './constants';
import mockedData from '../__mocks__/data_mock';

type OptionsType = { token?: string; cleanData?: boolean; apiKey?: string; origin?: string };

chai.use(chaiHttp);
/* Necessary to work with Typescript */
const chaiServer = chai.request(expressServer).keepOpen();

export const closeServer = (): ChaiHttp.Agent => chaiServer.close();

export const getWordSuggestions = (query = {}, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .get('/wordSuggestions')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const getRandomWordSuggestions = (query = {}, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .get('/wordSuggestions/random')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const getWordSuggestion = (
  id: mongoose.Types.ObjectId | string,
  options: OptionsType = { token: '' },
): Request =>
  chaiServer
    .get(`/wordSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const deleteWordSuggestion = (id: string, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .delete(`/wordSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const putRandomWordSuggestions = (
  data: { id: string; pronunciation?: string; review?: ReviewActions }[] | { id: string; igboDefinition: string }[],
  options: OptionsType = { token: '' },
): Request =>
  chaiServer
    .put('/wordSuggestions/random')
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const getRandomExampleSuggestionsToRecord = (query = {}, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .get('/exampleSuggestions/random/audio')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const getRandomExampleSuggestionsToReview = (query = {}, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .get('/exampleSuggestions/random/review')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const getTotalVerifiedExampleSuggestions = (query = {}, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .get('/exampleSuggestions/random/stats/verified')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const getTotalRecordedExampleSuggestions = (query = {}, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .get('/exampleSuggestions/random/stats/recorded')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const postBulkUploadExampleSuggestions = (
  data: { igbo: string }[],
  options: OptionsType = { token: '' },
): Request =>
  chaiServer
    .post('/exampleSuggestions/upload')
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const postBulkUploadExamples = (data: { igbo: string }[], options: OptionsType = { token: '' }): Request =>
  chaiServer
    .post('/examples/upload')
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const putAudioForRandomExampleSuggestions = (
  data: { id: string; pronunciations?: { audio: string; speaker: string }[]; review?: ReviewActions }[],
  options: OptionsType = { token: '' },
): Request =>
  chaiServer
    .put('/exampleSuggestions/random/audio')
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);
export const putReviewForRandomExampleSuggestions = (
  data: {
    id: string;
    pronunciations?: { audio: string; speaker: string }[];
    reviews?: { [key: string]: ReviewActions };
  }[],
  options: OptionsType = { token: '' },
): Request =>
  chaiServer
    .put('/exampleSuggestions/random/review')
    .send(data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const getExampleSuggestions = (query = {}, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .get('/exampleSuggestions')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const getExampleSuggestion = (id: string, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .get(`/exampleSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const deleteExampleSuggestion = (id: string, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .delete(`/exampleSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const getCorpusSuggestion = (id: string, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .get(`/corpusSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const getCorpusSuggestions = (query = {}, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .get('/corpusSuggestions')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const getPolls = (query = {}, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .get('/polls')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const deleteCorpusSuggestion = (id: string, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .delete(`/corpusSuggestions/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const createWord = async (id: string, query = {}, options: OptionsType = { token: '' }): Promise<Request> => {
  await chaiServer.put(`/wordSuggestions/${id}/approve`).set('Authorization', `Bearer ${AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);
  await chaiServer.put(`/wordSuggestions/${id}/approve`).set('Authorization', `Bearer ${AUTH_TOKEN.MERGER_AUTH_TOKEN}`);
  return chaiServer
    .post('/words')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .send({ id });
};

export const deleteWord = (id: string, primaryWordId: string, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .delete(`/words/${id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .send({ primaryWordId });

export const createExample = async (id: string, query = {}, options: OptionsType = { token: '' }): Promise<Request> => {
  await chaiServer
    .put(`/exampleSuggestions/${id}/approve`)
    .set('Authorization', `Bearer ${AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);
  await chaiServer
    .put(`/exampleSuggestions/${id}/approve`)
    .set('Authorization', `Bearer ${AUTH_TOKEN.MERGER_AUTH_TOKEN}`);
  return chaiServer
    .post('/examples')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .send({ id });
};

export const createCorpus = async (id: string, query = {}, options: OptionsType = { token: '' }): Promise<Request> => {
  await chaiServer
    .put(`/corpusSuggestions/${id}/approve`)
    .set('Authorization', `Bearer ${AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);
  await chaiServer
    .put(`/corpusSuggestions/${id}/approve`)
    .set('Authorization', `Bearer ${AUTH_TOKEN.MERGER_AUTH_TOKEN}`);
  return chaiServer
    .post('/corpora')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .send({ id });
};

export const createPoll = (id: string, query = {}, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .post('/twitter_poll')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .send({ id });

export const suggestNewWord = (
  data: any,
  options: {
    noApprovals?: boolean;
    token?: string;
    cleanData?: boolean;
  } = { noApprovals: false, token: '', cleanData: true },
): Request =>
  chaiServer
    .post('/wordSuggestions')
    .send(options.cleanData ? removePayloadFields(data) : data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const suggestNewExample = (data: any, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .post('/exampleSuggestions')
    .send(removePayloadFields(data))
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const suggestNewCorpus = (data: any, options: OptionsType = { token: '', cleanData: true }): Request =>
  chaiServer
    .post('/corpusSuggestions')
    .send(options?.cleanData ? removePayloadFields(data) : data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);
export const suggestNewNsibidiCharacter = (data: any, options: OptionsType = { token: '', cleanData: true }): Request =>
  chaiServer
    .post('/nsibidiCharacters')
    .send(options?.cleanData ? removePayloadFields(data) : data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);
export const deleteNsibidiCharacter = (
  data: { id: string },
  options: OptionsType = { token: '', cleanData: true },
): Request =>
  chaiServer
    .delete(`/nsibidiCharacters/${data.id}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const updateWordSuggestion = (
  data: any,
  options: { token?: string; cleanData?: boolean } = { token: '', cleanData: true },
): Request =>
  chaiServer
    .put(`/wordSuggestions/${data.id}`)
    .send(options?.cleanData ? removePayloadFields(data) : data)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const updateExampleSuggestion = (data: any, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .put(`/exampleSuggestions/${data.id}`)
    .send(removePayloadFields(data))
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const updateCorpusSuggestion = (data: any, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .put(`/corpusSuggestions/${data.id}`)
    .send(removePayloadFields(data))
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const updateNsibidiCharacter = (data: any, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .put(`/nsibidiCharacters/${data.id}`)
    .send(removePayloadFields(data))
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const updateWord = (data: any, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .put(`/words/${data.id}`)
    .send(removePayloadFields(data))
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const updateExample = (data: any, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .put(`/examples/${data.id}`)
    .send(removePayloadFields(data))
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const approveWordSuggestion = (data: any, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .put(`/wordSuggestions/${data.id}/approve`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const approveExampleSuggestion = (data: any, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .put(`/exampleSuggestions/${data.id}/approve`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const approveCorpusSuggestion = (data: any, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .put(`/corpusSuggestions/${data.id}/approve`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const denyWordSuggestion = (data: any, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .put(`/wordSuggestions/${data.id}/deny`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const denyExampleSuggestion = (data: any, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .put(`/exampleSuggestions/${data.id}/deny`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const denyCorpusSuggestion = (data: any, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .put(`/corpusSuggestions/${data.id}/deny`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

/* Searches for words using the data in MongoDB */
export const getWords = (query = {}, options: OptionsType = { token: '', apiKey: '', origin: '' }): Request =>
  chaiServer
    .get('/words')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER);

/* Searches for examples using the data in MongoDB */
export const getExamples = (query = {}, options: OptionsType = { token: '', apiKey: '', origin: '' }): Request =>
  chaiServer
    .get('/examples')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER);

export const getWord = (id: string, query = {}, options: OptionsType = { apiKey: '', origin: '' }): Request =>
  chaiServer
    .get(`/words/${id}`)
    .query(query)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER);

export const getExample = (id: string, query = {}, options: OptionsType = { apiKey: '', origin: '' }): Request =>
  chaiServer
    .get(`/examples/${id}`)
    .query(query)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER);

export const getNsibidiCharacter = (
  id: string,
  query = {},
  options: OptionsType = { apiKey: '', origin: '' },
): Request =>
  chaiServer
    .get(`/nsibidiCharacters/${id}`)
    .query(query)
    .set('X-API-Key', options.apiKey || API_KEY)
    .set('Origin', options.origin || ORIGIN_HEADER);

export const getUserStats = (uid: string, options: OptionsType = { apiKey: '', token: '' }): Request =>
  chaiServer
    .get(`/stats/users/${uid}`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .set('X-API-Key', options.apiKey || API_KEY);
export const getUserMergeStats = (uid: string, options: OptionsType = { apiKey: '', token: '' }): Request =>
  chaiServer
    .get(`/stats/users/${uid}/merge`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .set('X-API-Key', options.apiKey || API_KEY);
export const getUserAudioStats = (uid: string, options: OptionsType = { apiKey: '', token: '' }): Request =>
  chaiServer
    .get(`/stats/users/${uid}/audio`)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`)
    .set('X-API-Key', options.apiKey || API_KEY);

/* Mocks grabbing all users from Firebase */
export const getUsers = (options: OptionsType = { token: '' }): Request =>
  chaiServer.get('/users').set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

export const getLeaderboard = (query = {}, options: OptionsType = { token: '' }): Request =>
  chaiServer
    .get('/leaderboard')
    .query(query)
    .set('Authorization', `Bearer ${options.token || AUTH_TOKEN.ADMIN_AUTH_TOKEN}`);

/* Hits the POST /populate route to seed the local MongoDB database */
export const populateAPI = (): Request => chaiServer.post(`${TEST_ROUTE}/populate`);

export const getAPIUrlRoute = (route = LOCAL_ROUTE): Request => chai.request(API_URL).get(route);

export const getLocalUrlRoute = (route = LOCAL_ROUTE): Request => chaiServer.get(route);

/* Sends an email to all editors, mergers, and admins about
 * merged words and examples.
 */
export const sendEmailJob = (): Request => chaiServer.post(`${TEST_ROUTE}/email/mergedStats`);

/* Uses data in __mocks__ folder */
export const searchMockedTerm = (term: string): any => {
  const { wordReg: searchRegex } = createRegExp(term);
  return resultsFromDictionarySearch(searchRegex, mockedData);
};

// @ts-expect-error sendEmail
export const sendSendGridEmail = (message: Interfaces.ConstructedMessage): Request => sendEmail(message);
