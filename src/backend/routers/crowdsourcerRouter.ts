import express from 'express';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { getRandomWordSuggestions, putRandomWordSuggestions } from 'src/backend/controllers/wordSuggestions';
import {
  getRandomExampleSuggestionsToRecord,
  postBulkUploadExampleSuggestions,
  getRandomExampleSuggestionsToReview,
  getRandomExampleSuggestionsToTranslate,
  putRandomExampleSuggestionsToTranslate,
  getTotalVerifiedExampleSuggestions,
  getTotalRecordedExampleSuggestions,
  putAudioForRandomExampleSuggestions,
  putReviewForRandomExampleSuggestions,
} from 'src/backend/controllers/exampleSuggestions';
import {
  calculateReviewingExampleLeaderboard,
  calculateRecordingExampleLeaderboard,
  calculateTranslatingExampleLeaderboard,
  getLeaderboard,
} from 'src/backend/controllers/leaderboard';
import { getTextImages, postTextImage } from 'src/backend/controllers/textImages';
import { sendReportUserNotification } from 'src/backend/controllers/email';
import authentication from 'src/backend/middleware/authentication';
import authorization from 'src/backend/middleware/authorization';
import validateAudioRandomExampleSuggestionBody from 'src/backend/middleware/validateAudioRandomExampleSuggestionBody';
// eslint-disable-next-line max-len
import validateReviewRandomExampleSuggestionBody from 'src/backend/middleware/validateReviewRandomExampleSuggestionBody';
import validateRandomWordSuggestionBody from 'src/backend/middleware/validateRandomWordSuggestionBody';
import validateBulkUploadExampleSuggestionBody from 'src/backend/middleware/validateBulkUploadExampleSuggestionBody';
// eslint-disable-next-line max-len
import validateRandomExampleSuggestionTranslationBody from 'src/backend/middleware/validateRandomExampleSuggestionTranslationBody';
import validateTextImages from 'src/backend/middleware/validateTextImages';
import resourcePermission from 'src/backend/middleware/resourcePermission';
import { findReferralCode } from 'src/backend/controllers/crowdsourcer';
import { getUserStats, getUserMergeStats, getUserAudioStats } from 'src/backend/controllers/stats';
import cacheControl from 'src/backend/middleware/cacheControl';
import Collection from 'src/shared/constants/Collection';
import { getUserProfile, putUserProfile } from 'src/backend/controllers/users';

const crowdsourcerRouter = express.Router();
const allRoles = [UserRoles.EDITOR, UserRoles.MERGER, UserRoles.ADMIN, UserRoles.TRANSCRIBER, UserRoles.CROWDSOURCER];
crowdsourcerRouter.use(authentication, authorization(allRoles));

crowdsourcerRouter.get(`/${Collection.WORD_SUGGESTIONS}/random`, getRandomWordSuggestions);
crowdsourcerRouter.put(
  `/${Collection.WORD_SUGGESTIONS}/random`,
  validateRandomWordSuggestionBody,
  putRandomWordSuggestions,
);

crowdsourcerRouter.get(`/${Collection.EXAMPLE_SUGGESTIONS}/random/audio`, getRandomExampleSuggestionsToRecord);
crowdsourcerRouter.get(`/${Collection.EXAMPLE_SUGGESTIONS}/random/translate`, getRandomExampleSuggestionsToTranslate);
crowdsourcerRouter.put(
  `/${Collection.EXAMPLE_SUGGESTIONS}/random/translate`,
  validateRandomExampleSuggestionTranslationBody,
  putRandomExampleSuggestionsToTranslate,
  calculateTranslatingExampleLeaderboard,
);

// Records audio for example suggestion
crowdsourcerRouter.put(
  `/${Collection.EXAMPLE_SUGGESTIONS}/random/audio`,
  validateAudioRandomExampleSuggestionBody,
  putAudioForRandomExampleSuggestions,
  calculateRecordingExampleLeaderboard,
);
// Reviews audio for example suggestion
crowdsourcerRouter.put(
  `/${Collection.EXAMPLE_SUGGESTIONS}/random/review`,
  validateReviewRandomExampleSuggestionBody,
  putReviewForRandomExampleSuggestions,
  calculateReviewingExampleLeaderboard,
);
crowdsourcerRouter.post(
  `/${Collection.EXAMPLE_SUGGESTIONS}/upload`,
  authorization([UserRoles.ADMIN]),
  validateBulkUploadExampleSuggestionBody,
  postBulkUploadExampleSuggestions,
);
crowdsourcerRouter.get(`/${Collection.EXAMPLE_SUGGESTIONS}/random/review`, getRandomExampleSuggestionsToReview);
crowdsourcerRouter.get(
  `/${Collection.EXAMPLE_SUGGESTIONS}/random/stats/verified`,
  resourcePermission,
  getTotalVerifiedExampleSuggestions,
);
crowdsourcerRouter.get(
  `/${Collection.EXAMPLE_SUGGESTIONS}/random/stats/recorded`,
  resourcePermission,
  getTotalRecordedExampleSuggestions,
);

crowdsourcerRouter.get(`/${Collection.TEXT_IMAGES}`, getTextImages);
crowdsourcerRouter.post(`/${Collection.TEXT_IMAGES}`, validateTextImages, postTextImage);

// TODO: use the new resourcePermission middleware to only grant
// access to stats to the user who owns the stats or the admin
crowdsourcerRouter.get(`/${Collection.STATS}/user`, cacheControl, getUserStats);
crowdsourcerRouter.get(`/${Collection.STATS}/users/:uid/merge`, getUserMergeStats);
crowdsourcerRouter.get(`/${Collection.STATS}/users/:uid/audio`, getUserAudioStats);
crowdsourcerRouter.get(`/${Collection.STATS}/users/:uid`, cacheControl, getUserStats);

// Leaderboard
crowdsourcerRouter.get('/leaderboard', getLeaderboard);

// Email
crowdsourcerRouter.post('/email/report', sendReportUserNotification);

// Crowdsourcer
crowdsourcerRouter.get('/user', findReferralCode);
crowdsourcerRouter.get(`/${Collection.USERS}/:uid`, getUserProfile);
crowdsourcerRouter.put(`/${Collection.USERS}/:uid`, putUserProfile);

export default crowdsourcerRouter;
