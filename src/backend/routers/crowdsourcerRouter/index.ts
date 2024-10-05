import express from 'express';
import { getLeaderboard } from 'src/backend/controllers/leaderboard';
import {
  getUserExampleSuggestionRecordings,
  getUserExampleSuggestionTranslations,
} from 'src/backend/controllers/exampleSuggestions';
import { sendReportUserNotification } from 'src/backend/controllers/email';
import authorization from 'src/backend/middleware/authorization';
import resourcePermission from 'src/backend/middleware/resourcePermission';
import { createReferral } from 'src/backend/controllers/crowdsourcer';
import { getUserStats } from 'src/backend/controllers/stats';
import cacheControl from 'src/backend/middleware/cacheControl';
import Collection from 'src/shared/constants/Collection';
import { getUserProfile } from 'src/backend/controllers/users';
import { crowdsourcerRoles } from 'src/backend/shared/constants/RolePermissions';
import soundboxRouter from 'src/backend/routers/crowdsourcerRouter/soundboxRouter';

const crowdsourcerRouter = express.Router();
crowdsourcerRouter.use(authorization(crowdsourcerRoles));
crowdsourcerRouter.use(soundboxRouter);

// User Stats
// TODO: use the new resourcePermission middleware to only grant
// access to stats to the user who owns the stats or the admin
crowdsourcerRouter.get(`/${Collection.STATS}/user`, cacheControl, getUserStats);
crowdsourcerRouter.get(`/${Collection.STATS}/users/:uid`, cacheControl, getUserStats);
crowdsourcerRouter.get(
  `/${Collection.STATS}/users/:uid/${Collection.EXAMPLE_SUGGESTIONS}/recorded`,
  resourcePermission,
  getUserExampleSuggestionRecordings,
);
crowdsourcerRouter.get(
  `/${Collection.STATS}/users/:uid/${Collection.EXAMPLE_SUGGESTIONS}/translated`,
  resourcePermission,
  getUserExampleSuggestionTranslations,
);

// Leaderboard
crowdsourcerRouter.get('/leaderboard', getLeaderboard);

// Email
crowdsourcerRouter.post('/email/report', sendReportUserNotification);

// Crowdsourcer
crowdsourcerRouter.post(`/${Collection.USERS}/referral`, createReferral);
crowdsourcerRouter.get(`/${Collection.USERS}/:uid`, getUserProfile);

export default crowdsourcerRouter;
