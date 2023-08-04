/* eslint-disable global-require */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { TEST_MONGO_URI, LOCAL_MONGO_URI, PROD_MONGO_URI } from 'src/backend/config';

const config = functions.config();
const productionServiceAccountRaw = config?.runtime?.production;
const productionServiceAccount =
  typeof productionServiceAccountRaw === 'string'
    ? JSON.parse(productionServiceAccountRaw)
    : productionServiceAccountRaw;
const stagingServiceAccountRaw = config?.runtime?.staging;
const stagingServiceAccount =
  typeof stagingServiceAccountRaw === 'string' ? JSON.parse(stagingServiceAccountRaw) : stagingServiceAccountRaw;
export const MONGO_URI =
  config?.runtime?.env === 'cypress' || process.env.NODE_ENV === 'test'
    ? TEST_MONGO_URI
    : config?.runtime?.env === 'development'
    ? LOCAL_MONGO_URI
    : config?.runtime?.env === 'production'
    ? PROD_MONGO_URI
    : LOCAL_MONGO_URI;
const serviceAccount =
  config?.runtime?.env === 'production'
    ? (() => {
        let localProductionServiceAccount;
        if (!productionServiceAccount?.project_id) {
          localProductionServiceAccount = require('../../../prod-firebase-service-account.json'); // eslint-disable-line
        }
        return {
          projectId: productionServiceAccount?.project_id || localProductionServiceAccount.project_id,
          private_key: productionServiceAccount?.private_key
            ? productionServiceAccount.private_key.replace(/(\\\\n|\\n)/g, '\n')
            : localProductionServiceAccount.private_key,
          client_email: productionServiceAccount?.client_email || localProductionServiceAccount.client_email,
        };
      })()
    : (() => {
        let localStagingServiceAccount;
        if (!stagingServiceAccount?.project_id) {
          localStagingServiceAccount = require('../../../staging-firebase-service-account.json'); // eslint-disable-line
        }
        return {
          projectId: stagingServiceAccount?.project_id || localStagingServiceAccount.project_id,
          private_key: stagingServiceAccount?.private_key
            ? stagingServiceAccount.private_key.replace(/(\\\\n|\\n)/g, '\n')
            : localStagingServiceAccount.private_key,
          client_email: stagingServiceAccount?.client_email || localStagingServiceAccount.client_email,
        };
      })();

export const initializedAdminApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
