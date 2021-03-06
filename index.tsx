import { MONGO_URI } from './src/backend/services/initializeAdmin';
import * as functions from 'firebase-functions';
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
import { onRequestDeleteDocument, onUpdateDocument } from './src/backend/functions/documents';
import { onTwitterAuth, onTwitterCallback } from './src/backend/controllers/polls';
import {
  CORS_CONFIG,
  EXPRESS_PORT,
  IGBO_API_VOLUNTEER_HOME_BASE,
  WORD_CHECKLIST_URL,
  isProduction,
} from './src/backend/config';

const server = express();
const index = fs.readFileSync(`${__dirname}/index.html`, 'utf-8');

server.use(bodyParser.json());
server.options('*', cors(CORS_CONFIG));
server.use(cors(CORS_CONFIG));
server.use(afterRes(MONGO_URI)); // Handles closing MongoDB connections after each request
server.use('/favicon.ico', (_, res) => res.send('favicon'));
if (isProduction) {
  server.use('/test', testRouter);
}
server.get('/gettingstarted', (_, res) => res.redirect(301, IGBO_API_VOLUNTEER_HOME_BASE));
server.get('/checklist', (_, res) => res.redirect(301, WORD_CHECKLIST_URL));
server.use('/triggers', triggersRouter);
server.get('/twitter_auth', onTwitterAuth);
server.get('/twitter_callback', onTwitterCallback);
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

// Firebase Functions
export const createUserAccount = onCreateUserAccount;
export const assignUserToEditingGroup = onAssignUserToEditingGroup;
export const updatePermissions = onUpdatePermissions;
export const requestDeleteDocument = onRequestDeleteDocument;
export const updateDocument = onUpdateDocument;

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
