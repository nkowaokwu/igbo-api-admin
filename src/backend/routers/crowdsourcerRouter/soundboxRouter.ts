/* eslint-disable max-len */
import express from 'express';
import { getRandomWordSuggestions, putRandomWordSuggestions } from 'src/backend/controllers/wordSuggestions';
import {
  getRandomExampleSuggestionsToRecord,
  getRandomExampleSuggestionsToReview,
  getRandomExampleSuggestionsToTranslate,
  putRandomExampleSuggestionsToTranslate,
  putAudioForRandomExampleSuggestions,
  putReviewForRandomExampleSuggestions,
  putRandomExampleSuggestionReviewsForTranslation,
  getRandomExampleSuggestionForTranslationReview,
} from 'src/backend/controllers/exampleSuggestions';
import { getTextImages, postTextImage } from 'src/backend/controllers/textImages';

import validateAudioRandomExampleSuggestionBody from 'src/backend/middleware/validateAudioRandomExampleSuggestionBody';
import validateReviewRandomExampleSuggestionBody from 'src/backend/middleware/validateReviewRandomExampleSuggestionBody';
import validateRandomWordSuggestionBody from 'src/backend/middleware/validateRandomWordSuggestionBody';
import validateRandomExampleSuggestionTranslationBody from 'src/backend/middleware/validateRandomExampleSuggestionTranslationBody';
import validateRandomExampleSuggestionTranslationReviews from 'src/backend/middleware/validateRandomExampleSuggestionTranslationReviews';
import validateTextImages from 'src/backend/middleware/validateTextImages';
import Collection from 'src/shared/constants/Collection';
import validateIsMultilingual from 'src/backend/middleware/validateIsMultilingual';

const soundboxRouter = express.Router();

/**
 * Word Suggestions
 */
soundboxRouter.get(`/${Collection.WORD_SUGGESTIONS}/random`, getRandomWordSuggestions);
soundboxRouter.put(
  `/${Collection.WORD_SUGGESTIONS}/random`,
  validateRandomWordSuggestionBody,
  putRandomWordSuggestions,
);

/**
 * Example Suggestions
 */
soundboxRouter.get(`/${Collection.EXAMPLE_SUGGESTIONS}/audio`, getRandomExampleSuggestionsToRecord);
// Gets example suggestions to review
soundboxRouter.get(`/${Collection.EXAMPLE_SUGGESTIONS}/review`, getRandomExampleSuggestionsToReview);
soundboxRouter.get(
  `/${Collection.EXAMPLE_SUGGESTIONS}/translate`,
  validateIsMultilingual,
  getRandomExampleSuggestionsToTranslate,
);
soundboxRouter.get(
  `/${Collection.EXAMPLE_SUGGESTIONS}/translate/review`,
  validateIsMultilingual,
  getRandomExampleSuggestionForTranslationReview,
);

soundboxRouter.put(
  `/${Collection.EXAMPLE_SUGGESTIONS}/translate`,
  validateRandomExampleSuggestionTranslationBody,
  putRandomExampleSuggestionsToTranslate,
);
soundboxRouter.put(
  `/${Collection.EXAMPLE_SUGGESTIONS}/translate/review`,
  validateRandomExampleSuggestionTranslationReviews,
  putRandomExampleSuggestionReviewsForTranslation,
);

// Records audio for example suggestion
soundboxRouter.put(
  `/${Collection.EXAMPLE_SUGGESTIONS}/audio`,
  validateAudioRandomExampleSuggestionBody,
  putAudioForRandomExampleSuggestions,
);
// Reviews audio for example suggestion
soundboxRouter.put(
  `/${Collection.EXAMPLE_SUGGESTIONS}/review`,
  validateReviewRandomExampleSuggestionBody,
  putReviewForRandomExampleSuggestions,
);

/**
 * Text Images
 */
soundboxRouter.get(`/${Collection.TEXT_IMAGES}`, getTextImages);
soundboxRouter.post(`/${Collection.TEXT_IMAGES}`, validateTextImages, postTextImage);

export default soundboxRouter;
