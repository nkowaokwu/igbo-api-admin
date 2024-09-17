import express from 'express';
import { getRandomWordSuggestions, putRandomWordSuggestions } from 'src/backend/controllers/wordSuggestions';
import {
  getRandomExampleSuggestionsToRecord,
  getRandomExampleSuggestionsToReview,
  getRandomExampleSuggestionsToTranslate,
  putRandomExampleSuggestionsToTranslate,
  getTotalReviewedExampleSuggestions,
  getTotalRecordedExampleSuggestions,
  putAudioForRandomExampleSuggestions,
  putReviewForRandomExampleSuggestions,
  getTotalMergedRecordedExampleSuggestions,
} from 'src/backend/controllers/exampleSuggestions';
import { calculateTranslatingExampleLeaderboard, getLeaderboard } from 'src/backend/controllers/leaderboard';
import { getTextImages, postTextImage } from 'src/backend/controllers/textImages';
import { sendReportUserNotification } from 'src/backend/controllers/email';
import authorization from 'src/backend/middleware/authorization';
import validateAudioRandomExampleSuggestionBody from 'src/backend/middleware/validateAudioRandomExampleSuggestionBody';
// eslint-disable-next-line max-len
import validateReviewRandomExampleSuggestionBody from 'src/backend/middleware/validateReviewRandomExampleSuggestionBody';
import validateRandomWordSuggestionBody from 'src/backend/middleware/validateRandomWordSuggestionBody';
// eslint-disable-next-line max-len
import validateRandomExampleSuggestionTranslationBody from 'src/backend/middleware/validateRandomExampleSuggestionTranslationBody';
import validateTextImages from 'src/backend/middleware/validateTextImages';
import resourcePermission from 'src/backend/middleware/resourcePermission';
import { createReferral } from 'src/backend/controllers/crowdsourcer';
import { getUserStats, getUserMergeStats, getUserAudioStats } from 'src/backend/controllers/stats';
import cacheControl from 'src/backend/middleware/cacheControl';
import Collection from 'src/shared/constants/Collection';
import { getUserProfile, putUserProfile } from 'src/backend/controllers/users';
import { crowdsourcerRoles } from 'src/backend/shared/constants/RolePermissions';

const crowdsourcerRouter = express.Router();
crowdsourcerRouter.use(authorization(crowdsourcerRoles));

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
);
// Reviews audio for example suggestion
crowdsourcerRouter.put(
  `/${Collection.EXAMPLE_SUGGESTIONS}/random/review`,
  validateReviewRandomExampleSuggestionBody,
  putReviewForRandomExampleSuggestions,
);

// Gets example suggestions to review
crowdsourcerRouter.get(`/${Collection.EXAMPLE_SUGGESTIONS}/random/review`, getRandomExampleSuggestionsToReview);
// Gets user's stats on how many examples suggestions they have reviewed
crowdsourcerRouter.get(
  `/${Collection.EXAMPLE_SUGGESTIONS}/random/stats/reviewed`,
  resourcePermission,
  getTotalReviewedExampleSuggestions,
);
// Gets user's stats on how many examples suggestions they have recorded
crowdsourcerRouter.get(
  `/${Collection.EXAMPLE_SUGGESTIONS}/random/stats/recorded`,
  resourcePermission,
  getTotalRecordedExampleSuggestions,
);
// Gets user's stats on how many of their example suggestions have been merged
crowdsourcerRouter.get(
  `/${Collection.EXAMPLE_SUGGESTIONS}/random/stats/recorded/merged`,
  resourcePermission,
  getTotalMergedRecordedExampleSuggestions,
);

crowdsourcerRouter.get(`/${Collection.TEXT_IMAGES}`, getTextImages);
crowdsourcerRouter.post(`/${Collection.TEXT_IMAGES}`, validateTextImages, postTextImage);

// TODO: use the new resourcePermission middleware to only grant
// access to stats to the user who owns the stats or the admin
crowdsourcerRouter.get(`/${Collection.STATS}/user`, cacheControl, getUserStats);
crowdsourcerRouter.get(`/${Collection.STATS}/users/:uid/merge`, resourcePermission, getUserMergeStats);
crowdsourcerRouter.get(`/${Collection.STATS}/users/:uid/audio`, resourcePermission, getUserAudioStats);
crowdsourcerRouter.get(`/${Collection.STATS}/users/:uid`, cacheControl, getUserStats);

// Leaderboard
crowdsourcerRouter.get('/leaderboard', getLeaderboard);

// Email
crowdsourcerRouter.post('/email/report', sendReportUserNotification);

// Crowdsourcer
crowdsourcerRouter.post(`/${Collection.USERS}/referral`, createReferral);
crowdsourcerRouter.get(`/${Collection.USERS}/:uid`, getUserProfile);
crowdsourcerRouter.put(`/${Collection.USERS}/:uid`, putUserProfile);

export default crowdsourcerRouter;
