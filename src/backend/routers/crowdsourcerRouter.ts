import express from 'express';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { getRandomWordSuggestions, putRandomWordSuggestions } from 'src/backend/controllers/wordSuggestions';
import {
  getRandomExampleSuggestions,
  postBulkUploadExampleSuggestions,
  getRandomExampleSuggestionsToReview,
  getTotalVerifiedExampleSuggestions,
  getTotalRecordedExampleSuggestions,
  putAudioForRandomExampleSuggestions,
  putReviewForRandomExampleSuggestions,
} from 'src/backend/controllers/exampleSuggestions';
import {
  calculateReviewingExampleLeaderboard,
  calculateRecordingExampleLeaderboard,
  getLeaderboard,
} from 'src/backend/controllers/leaderboard';
import authentication from 'src/backend/middleware/authentication';
import authorization from 'src/backend/middleware/authorization';
import validateAudioRandomExampleSuggestionBody from 'src/backend/middleware/validateAudioRandomExampleSuggestionBody';
import validateReviewRandomExampleSuggestionBody from 'src/backend/middleware/validateReviewRandomExampleSuggestionBody';
import validateRandomWordSuggestionBody from 'src/backend/middleware/validateRandomWordSuggestionBody';
import validateBulkUploadExampleSuggestionBody from 'src/backend/middleware/validateBulkUploadExampleSuggestionBody';
import resourcePermission from 'src/backend/middleware/resourcePermission';
import { getUserStats, getUserMergeStats } from 'src/backend/controllers/stats';
import cacheControl from 'src/backend/middleware/cacheControl';

const crowdsourcerRouter = express.Router();
const allRoles = [UserRoles.EDITOR, UserRoles.MERGER, UserRoles.ADMIN, UserRoles.TRANSCRIBER, UserRoles.CROWDSOURCER];
crowdsourcerRouter.use(authentication, authorization(allRoles));

crowdsourcerRouter.get('/wordSuggestions/random', getRandomWordSuggestions);
crowdsourcerRouter.put('/wordSuggestions/random', validateRandomWordSuggestionBody, putRandomWordSuggestions);

crowdsourcerRouter.get('/exampleSuggestions/random', getRandomExampleSuggestions);

// Records audio for example suggestion
crowdsourcerRouter.put(
  '/exampleSuggestions/random/audio',
  validateAudioRandomExampleSuggestionBody,
  putAudioForRandomExampleSuggestions,
  calculateRecordingExampleLeaderboard,
);
// Reviews audio for example suggestion
crowdsourcerRouter.put(
  '/exampleSuggestions/random/review',
  validateReviewRandomExampleSuggestionBody,
  putReviewForRandomExampleSuggestions,
  calculateReviewingExampleLeaderboard,
);
crowdsourcerRouter.post(
  '/exampleSuggestions/upload',
  authorization([UserRoles.ADMIN]),
  validateBulkUploadExampleSuggestionBody,
  postBulkUploadExampleSuggestions,
);
crowdsourcerRouter.get('/exampleSuggestions/random/review', getRandomExampleSuggestionsToReview);
crowdsourcerRouter.get(
  '/exampleSuggestions/random/stats/verified',
  resourcePermission,
  getTotalVerifiedExampleSuggestions,
);
crowdsourcerRouter.get(
  '/exampleSuggestions/random/stats/recorded',
  resourcePermission,
  getTotalRecordedExampleSuggestions,
);

// TODO: use the new resourcePermission middleware to only grant
// access to stats to the user who owns the stats or the admin
crowdsourcerRouter.get('/stats/user', cacheControl, getUserStats);
crowdsourcerRouter.get('/stats/users/:uid/merge', getUserMergeStats);
crowdsourcerRouter.get('/stats/users/:uid', cacheControl, getUserStats);

// Leaderboard
crowdsourcerRouter.get('/leaderboard', getLeaderboard);

export default crowdsourcerRouter;
