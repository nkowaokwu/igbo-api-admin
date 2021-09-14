import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import './src/backend/shared/utils/wrapConsole';
import { sendWeeklyStats, onSendEditorReminderEmail } from './src/backend/services/emailJobs';
import triggersRouter from './src/backend/routers/triggersRouter';
import apiRouter from './src/backend/routers/apiRouter';
import editorRouter from './src/backend/routers/editorRouter';
import adminRouter from './src/backend/routers/adminRouter';
import testRouter from './src/backend/routers/testRouter';
import errorHandler from './src/backend/middleware/errorHandler';
import afterRes from './src/backend/middleware/afterRes';
import { onCreateUserAccount, onAssignUserToEditingGroup, onUpdatePermissions } from './src/backend/functions/users';
import {
  TEST_MONGO_URI,
  LOCAL_MONGO_URI,
  PROD_MONGO_URI,
  CORS_CONFIG,
  EXPRESS_PORT,
  IGBO_API_VOLUNTEER_HOME_BASE,
  WORD_CHECKLIST_URL,
} from './src/backend/config';

const config = functions.config();
const productionServiceAccount = config?.runtime?.production;
const stagingServiceAccount = config?.runtime?.staging;
const MONGO_URI = config?.runtime?.env === 'cypress' || process.env.NODE_ENV === 'test'
? TEST_MONGO_URI
: config?.runtime?.env === 'development'
? LOCAL_MONGO_URI
: config?.runtime?.env === 'production'
? PROD_MONGO_URI
: LOCAL_MONGO_URI;
const serviceAccount = config?.runtime?.env === 'production' ? (() => {
  let localProductionServiceAccount;
  if (!productionServiceAccount?.project_id) {
    localProductionServiceAccount = require('./prod-firebase-service-account.json');
  }
  return {
    projectId: productionServiceAccount?.project_id || localProductionServiceAccount.project_id,
    private_key: productionServiceAccount?.private_key ? productionServiceAccount.private_key.replace(/(\\\\n|\\n)/g, '\n') : localProductionServiceAccount.private_key,
    client_email: productionServiceAccount?.client_email || localProductionServiceAccount.client_email,
  }
})() : (() => {
  let localStagingServiceAccount;
  if (!stagingServiceAccount?.project_id) {
    localStagingServiceAccount = require('./staging-firebase-service-account.json');
  }
  return {
    projectId: stagingServiceAccount?.project_id || localStagingServiceAccount.project_id,
    private_key: stagingServiceAccount?.private_key ? stagingServiceAccount.private_key.replace(/(\\\\n|\\n)/g, '\n') : localStagingServiceAccount.private_key,
    client_email: stagingServiceAccount?.client_email || localStagingServiceAccount.client_email,
  };
 })();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const server = express();
const index = fs.readFileSync(`${__dirname}/index.html`, 'utf-8');

server.use(bodyParser.json());
server.options('*', cors(CORS_CONFIG));
server.use(cors(CORS_CONFIG));
server.use(afterRes(MONGO_URI)); // Handles closing MongoDB connections after each request
server.use('/favicon.ico', (_, res) => res.send('favicon'));

if (config?.runtime?.env !== 'production' && process.env.NODE_ENV !== 'production') {
  server.use('/test', testRouter);
}
server.get('/gettingstarted', (_, res) => res.redirect(301, IGBO_API_VOLUNTEER_HOME_BASE));
server.get('/checklist', (_, res) => res.redirect(301, WORD_CHECKLIST_URL));
server.use('/triggers', triggersRouter);
server.use(apiRouter);
server.use(editorRouter);
server.use(adminRouter);
server.get('**', (_, res) => {
  const html = '';
  const finalHtml = index.replace('<!-- ::APP:: -->', html);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(finalHtml);
});
server.use(errorHandler);

export const createUserAccount = onCreateUserAccount;
export const assignUserToEditingGroup = onAssignUserToEditingGroup;
export const updatePermissions = onUpdatePermissions;

/* Runs every Monday at 6AM PST */
export const sendEditorStatsEmail = functions.pubsub.schedule('0 6 * * 1')
  .timeZone('America/Los_Angeles')
  .onRun(sendWeeklyStats);
export const sendEditorReminderEmail = functions.pubsub.schedule('0 6 */4 * *')
  .timeZone('America/Los_Angeles')
  .onRun(onSendEditorReminderEmail);

/**
 * Determines whether or not in a backend testing environment or in a
 * frontend testing or development environment.
 *
 * If in a backend testing environment, app will be assigned to the raw
 * Express app.
 *
 * If in a frontend testing or development environment, then app will
 * be assigned to the Firebase wrapped server.
 */
export const app = process.env.NODE_ENV === 'test' ? (() => {
  /* Export just the Express app while testing the backend */
  const expressServer: any = server.listen(EXPRESS_PORT, () => {
    // @ts-ignore
    console.blue(`\nExpress app listening on port ${EXPRESS_PORT}`);
  });

  expressServer.clearDatabase = () => mongoose.connection.dropDatabase();
  return expressServer;
})() : functions.https.onRequest(server);
