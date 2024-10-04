import express from 'express';
import {
  deleteOldWordSuggestions,
  getWordSuggestion,
  getWordSuggestions,
  putWordSuggestion,
  postWordSuggestion,
  approveWordSuggestion,
  denyWordSuggestion,
} from 'src/backend/controllers/wordSuggestions';
import { getAssociatedWordSuggestions, getAssociatedWordSuggestionsByTwitterId } from 'src/backend/controllers/words';
import { putCorpus, mergeCorpus } from 'src/backend/controllers/corpora';
import { getAssociatedExampleSuggestions } from 'src/backend/controllers/examples';
import {
  getExampleSuggestion,
  getExampleSuggestions,
  putExampleSuggestion,
  postExampleSuggestion,
  approveExampleSuggestion,
  denyExampleSuggestion,
} from 'src/backend/controllers/exampleSuggestions';
import { getExampleTranscriptionFeedback } from 'src/backend/controllers/exampleTranscriptionFeedback';
import {
  getNsibidiCharacters,
  getNsibidiCharacter,
  postNsibidiCharacter,
  putNsibidiCharacter,
  deleteNsibidiCharacter,
} from 'src/backend/controllers/nsibidiCharacters';
import { getStats } from 'src/backend/controllers/stats';
import { getPolls } from 'src/backend/controllers/polls';
import { getNotifications, getNotification, deleteNotification } from 'src/backend/controllers/notifications';
import validId from 'src/backend/middleware/validId';
import authorization from 'src/backend/middleware/authorization';
import validateExampleBody from 'src/backend/middleware/validateExampleBody';
import validateWordBody from 'src/backend/middleware/validateWordBody';
import validateCorpusBody from 'src/backend/middleware/validateCorpusBody';
import validateCorpusMerge from 'src/backend/middleware/validateCorpusMerge';
import validateNsibidiCharacterBody from 'src/backend/middleware/validateNsibidiCharacterBody';
import interactWithSuggestion from 'src/backend/middleware/interactWithSuggestion';
import resolveWordDocument from 'src/backend/middleware/resolveWordDocument';
import Collection from 'src/shared/constants/Collection';
import { adminRoles, editorRoles, nsibidiMergerRoles } from 'src/backend/shared/constants/RolePermissions';

const editorRouter = express.Router();
editorRouter.use(authorization(editorRoles));

/* These routes are used to allow users to suggest new words and examples */
editorRouter.get(`/${Collection.WORDS}/:id/wordSuggestions`, validId, getAssociatedWordSuggestions);
editorRouter.get(`/${Collection.WORDS}/:id/twitterPolls`, getAssociatedWordSuggestionsByTwitterId);

editorRouter.get(`/${Collection.EXAMPLES}/:id/exampleSuggestions`, validId, getAssociatedExampleSuggestions);

editorRouter.post(`/${Collection.CORPORA}`, authorization(adminRoles), validateCorpusMerge, mergeCorpus);
editorRouter.put(`/${Collection.CORPORA}/:id`, authorization(adminRoles), validId, validateCorpusBody, putCorpus);

editorRouter.get(`/${Collection.WORD_SUGGESTIONS}`, getWordSuggestions);
editorRouter.post(
  `/${Collection.WORD_SUGGESTIONS}`,
  validateWordBody,
  interactWithSuggestion,
  resolveWordDocument,
  postWordSuggestion,
);

editorRouter.put(
  `/${Collection.WORD_SUGGESTIONS}/:id`,
  validId,
  validateWordBody,
  interactWithSuggestion,
  resolveWordDocument,
  putWordSuggestion,
);
editorRouter.get(`/${Collection.WORD_SUGGESTIONS}/:id`, validId, getWordSuggestion);
editorRouter.put(`/${Collection.WORD_SUGGESTIONS}/:id/approve`, validId, approveWordSuggestion);
editorRouter.put(`/${Collection.WORD_SUGGESTIONS}/:id/deny`, validId, denyWordSuggestion);
editorRouter.delete(`/${Collection.WORD_SUGGESTIONS}/old`, authorization(adminRoles), deleteOldWordSuggestions);

editorRouter.get(`/${Collection.EXAMPLE_SUGGESTIONS}`, getExampleSuggestions);

editorRouter.post(
  `/${Collection.EXAMPLE_SUGGESTIONS}`,
  validateExampleBody,
  interactWithSuggestion,
  postExampleSuggestion,
);
editorRouter.put(
  `/${Collection.EXAMPLE_SUGGESTIONS}/:id`,
  validId,
  validateExampleBody,
  interactWithSuggestion,
  putExampleSuggestion,
);
editorRouter.get(`/${Collection.EXAMPLE_SUGGESTIONS}/:id`, validId, getExampleSuggestion);
editorRouter.put(`/${Collection.EXAMPLE_SUGGESTIONS}/:id/approve`, validId, approveExampleSuggestion);
editorRouter.put(`/${Collection.EXAMPLE_SUGGESTIONS}/:id/deny`, validId, denyExampleSuggestion);

editorRouter.get(`/${Collection.EXAMPLE_TRANSCRIPTION_FEEDBACK}/:id`, validId, getExampleTranscriptionFeedback);

editorRouter.get(`/${Collection.NSIBIDI_CHARACTERS}`, getNsibidiCharacters);
editorRouter.get(`/${Collection.NSIBIDI_CHARACTERS}/:id`, validId, getNsibidiCharacter);
editorRouter.post(
  `/${Collection.NSIBIDI_CHARACTERS}`,
  authorization(nsibidiMergerRoles),
  validateNsibidiCharacterBody,
  postNsibidiCharacter,
);
editorRouter.put(
  `/${Collection.NSIBIDI_CHARACTERS}/:id`,
  authorization(nsibidiMergerRoles),
  validId,
  validateNsibidiCharacterBody,
  putNsibidiCharacter,
);
editorRouter.delete(
  `/${Collection.NSIBIDI_CHARACTERS}/:id`,
  authorization(adminRoles),
  validId,
  deleteNsibidiCharacter,
);

editorRouter.get(`/${Collection.POLLS}`, getPolls);

editorRouter.get(`/${Collection.NOTIFICATIONS}`, getNotifications);
editorRouter.get(`/${Collection.NOTIFICATIONS}/:id`, getNotification);
editorRouter.delete(`/${Collection.NOTIFICATIONS}/:id`, deleteNotification);

editorRouter.get(`/${Collection.STATS}/full`, getStats);

export default editorRouter;
