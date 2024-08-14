import express from 'express';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import {
  deleteWordSuggestion,
  bulkDeleteWordSuggestions,
  deleteOldWordSuggestions,
  getWordSuggestion,
  getWordSuggestions,
  putWordSuggestion,
  postWordSuggestion,
  approveWordSuggestion,
  denyWordSuggestion,
  postRandomWordSuggestionsForIgboDefinitions,
} from 'src/backend/controllers/wordSuggestions';
import { deleteCorpusSuggestion } from 'src/backend/controllers/corpusSuggestions';
import {
  deleteWord,
  putWord,
  mergeWord,
  getAssociatedWordSuggestions,
  getAssociatedWordSuggestionsByTwitterId,
} from 'src/backend/controllers/words';
import { putCorpus, mergeCorpus } from 'src/backend/controllers/corpora';
import { putExample, mergeExample, getAssociatedExampleSuggestions } from 'src/backend/controllers/examples';
import {
  deleteExampleSuggestion,
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
import authentication from 'src/backend/middleware/authentication';
import authorization from 'src/backend/middleware/authorization';
import validateExampleBody from 'src/backend/middleware/validateExampleBody';
import validateExampleMerge from 'src/backend/middleware/validateExampleMerge';
import validateWordBody from 'src/backend/middleware/validateWordBody';
import validateWordMerge from 'src/backend/middleware/validateWordMerge';
import validateCorpusBody from 'src/backend/middleware/validateCorpusBody';
import validateCorpusMerge from 'src/backend/middleware/validateCorpusMerge';
import validateApprovals from 'src/backend/middleware/validateApprovals';
import validateNsibidiCharacterBody from 'src/backend/middleware/validateNsibidiCharacterBody';
import interactWithSuggestion from 'src/backend/middleware/interactWithSuggestion';
import resolveWordDocument from 'src/backend/middleware/resolveWordDocument';
import validateBulkDeleteLimit from 'src/backend/middleware/validateBulkDeleteLimit';
import Collection from 'src/shared/constants/Collection';
import { editorRoles } from 'src/backend/shared/constants/RolePermissions';

const editorRouter = express.Router();
editorRouter.use(authentication, authorization(editorRoles));

/* These routes are used to allow users to suggest new words and examples */
editorRouter.post(
  `/${Collection.WORDS}`,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  validateWordMerge,
  validateApprovals,
  mergeWord,
);
editorRouter.put(`/${Collection.WORDS}/:id`, authorization([UserRoles.MERGER, UserRoles.ADMIN]), validId, putWord);
editorRouter.delete(
  `/${Collection.WORDS}/:id`,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  validId,
  deleteWord,
);
editorRouter.get(`/${Collection.WORDS}/:id/wordSuggestions`, validId, getAssociatedWordSuggestions);
editorRouter.get(`/${Collection.WORDS}/:id/twitterPolls`, getAssociatedWordSuggestionsByTwitterId);

editorRouter.post(
  `/${Collection.EXAMPLES}`,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  validateExampleMerge,
  mergeExample,
);
editorRouter.put(
  `/${Collection.EXAMPLES}/:id`,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  validId,
  putExample,
);
editorRouter.get(`/${Collection.EXAMPLES}/:id/exampleSuggestions`, validId, getAssociatedExampleSuggestions);

editorRouter.post(`/${Collection.CORPORA}`, authorization([UserRoles.ADMIN]), validateCorpusMerge, mergeCorpus);
editorRouter.put(
  `/${Collection.CORPORA}/:id`,
  authorization([UserRoles.ADMIN]),
  validId,
  validateCorpusBody,
  putCorpus,
);

editorRouter.get(`/${Collection.WORD_SUGGESTIONS}`, getWordSuggestions);
editorRouter.post(
  `/${Collection.WORD_SUGGESTIONS}`,
  authorization([]),
  validateWordBody,
  interactWithSuggestion,
  resolveWordDocument,
  postWordSuggestion,
);
editorRouter.post(
  `/${Collection.WORD_SUGGESTIONS}/igbo-definitions`,
  authorization([UserRoles.ADMIN]),
  postRandomWordSuggestionsForIgboDefinitions,
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
editorRouter.delete(
  `/${Collection.WORD_SUGGESTIONS}`,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  validateBulkDeleteLimit,
  bulkDeleteWordSuggestions,
);
editorRouter.delete(`/${Collection.WORD_SUGGESTIONS}/old`, authorization([UserRoles.ADMIN]), deleteOldWordSuggestions);
editorRouter.delete(
  `/${Collection.WORD_SUGGESTIONS}/:id`,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  validId,
  deleteWordSuggestion,
);

editorRouter.get(`/${Collection.EXAMPLE_SUGGESTIONS}`, getExampleSuggestions);

editorRouter.post(
  `/${Collection.EXAMPLE_SUGGESTIONS}`,
  authorization(editorRoles),
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
editorRouter.delete(
  `/${Collection.EXAMPLE_SUGGESTIONS}/:id`,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  validId,
  deleteExampleSuggestion,
);

editorRouter.get(`/${Collection.EXAMPLE_TRANSCRIPTION_FEEDBACK}/:id`, validId, getExampleTranscriptionFeedback);

editorRouter.get(`/${Collection.NSIBIDI_CHARACTERS}`, getNsibidiCharacters);
editorRouter.get(`/${Collection.NSIBIDI_CHARACTERS}/:id`, validId, getNsibidiCharacter);
editorRouter.post(
  `/${Collection.NSIBIDI_CHARACTERS}`,
  authorization([UserRoles.NSIBIDI_MERGER, UserRoles.MERGER, UserRoles.ADMIN]),
  validateNsibidiCharacterBody,
  postNsibidiCharacter,
);
editorRouter.put(
  `/${Collection.NSIBIDI_CHARACTERS}/:id`,
  authorization([UserRoles.NSIBIDI_MERGER, UserRoles.MERGER, UserRoles.ADMIN]),
  validId,
  validateNsibidiCharacterBody,
  putNsibidiCharacter,
);
editorRouter.delete(
  `/${Collection.NSIBIDI_CHARACTERS}/:id`,
  authorization([UserRoles.ADMIN]),
  validId,
  deleteNsibidiCharacter,
);

editorRouter.delete(
  `/${Collection.CORPUS_SUGGESTIONS}/:id`,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  validId,
  deleteCorpusSuggestion,
);

editorRouter.get(`/${Collection.POLLS}`, getPolls);

editorRouter.get(`/${Collection.NOTIFICATIONS}`, getNotifications);
editorRouter.get(`/${Collection.NOTIFICATIONS}/:id`, getNotification);
editorRouter.delete(`/${Collection.NOTIFICATIONS}/:id`, deleteNotification);

editorRouter.get(`/${Collection.STATS}/full`, getStats);

export default editorRouter;
