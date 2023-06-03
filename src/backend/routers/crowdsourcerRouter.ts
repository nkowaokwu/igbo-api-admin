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
import validateReviewRandomExampleSuggestionBody
  from 'src/backend/middleware/validateReviewRandomExampleSuggestionBody';
import validateRandomWordSuggestionBody from 'src/backend/middleware/validateRandomWordSuggestionBody';
import validateBulkUploadExampleSuggestionBody from 'src/backend/middleware/validateBulkUploadExampleSuggestionBody';
import resourcePermission from 'src/backend/middleware/resourcePermission';

const crowdsourcerRouter = express.Router();
const allRoles = [UserRoles.EDITOR, UserRoles.MERGER, UserRoles.ADMIN, UserRoles.TRANSCRIBER, UserRoles.CROWDSOURCER];
crowdsourcerRouter.use(authentication, authorization(allRoles));

crowdsourcerRouter.get('/wordSuggestions/random', getRandomWordSuggestions);
crowdsourcerRouter.put(
  '/wordSuggestions/random',
  validateRandomWordSuggestionBody,
  putRandomWordSuggestions,
);

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

// Leaderboard
crowdsourcerRouter.get('/leaderboard', getLeaderboard);

export default crowdsourcerRouter;
