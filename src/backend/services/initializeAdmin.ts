/* eslint-disable global-require */
import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { TEST_MONGO_URI, LOCAL_MONGO_URI, PROD_MONGO_URI } from 'src/backend/config';

const config = functions.config();
const isProduction = config?.runtime?.env === 'production';

export const MONGO_URI =
  process.env.NODE_ENV === 'test'
    ? TEST_MONGO_URI
    : config?.runtime?.env === 'development'
    ? LOCAL_MONGO_URI
    : config?.runtime?.env === 'production'
    ? PROD_MONGO_URI
    : LOCAL_MONGO_URI;

export const initializedAdminApp = isProduction
  ? admin.initializeApp({ projectId: 'igbo-api-admin' })
  : admin.initializeApp({ projectId: 'igbo-api-admin-staging' });
