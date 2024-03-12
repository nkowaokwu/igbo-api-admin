/* eslint-disable global-require */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { TEST_MONGO_URI, LOCAL_MONGO_URI, PROD_MONGO_URI } from 'src/backend/config';

const config = functions.config();

export const MONGO_URI =
  config?.runtime?.env === 'cypress' || process.env.NODE_ENV === 'test'
    ? TEST_MONGO_URI
    : config?.runtime?.env === 'development'
    ? LOCAL_MONGO_URI
    : config?.runtime?.env === 'production'
    ? PROD_MONGO_URI
    : LOCAL_MONGO_URI;
// const serviceAccount =
//   config?.runtime?.env === 'production'
//     ? {
//         projectId: productionServiceAccount?.project_id,
//         private_key: productionServiceAccount.private_key.replace(/(\\\\n|\\n)/g, '\n'),
//         client_email: productionServiceAccount?.client_email,
//       }
//     : {
//         projectId: stagingServiceAccount?.project_id,
//         private_key: stagingServiceAccount.private_key.replace(/(\\\\n|\\n)/g, '\n'),
//         client_email: stagingServiceAccount?.client_email,
//       };

export const initializedAdminApp = admin.initializeApp();
