import express from 'express';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import {
  deleteWordSuggestion,
  getWordSuggestion,
  getWordSuggestions,
  putWordSuggestion,
  postWordSuggestion,
  approveWordSuggestion,
  denyWordSuggestion,
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
import {
  getNsibidiCharacters,
  getNsibidiCharacter,
  postNsibidiCharacter,
  putNsibidiCharacter,
} from 'src/backend/controllers/nsibidiCharacters';
import {
  getStats,
  getUserStats,
  getUserMergeStats,
} from 'src/backend/controllers/stats';
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
import cacheControl from 'src/backend/middleware/cacheControl';
import interactWithSuggestion from 'src/backend/middleware/interactWithSuggestion';
import resolveWordDocument from 'src/backend/middleware/resolveWordDocument';

const editorRouter = express.Router();
const platformRoles = [UserRoles.EDITOR, UserRoles.MERGER, UserRoles.ADMIN];
editorRouter.use(authentication, authorization(platformRoles));

/* These routes are used to allow users to suggest new words and examples */
editorRouter.post(
  '/words',
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  validateWordMerge,
  validateApprovals,
  mergeWord,
);
editorRouter.put('/words/:id', authorization([UserRoles.MERGER, UserRoles.ADMIN]), validId, putWord);
editorRouter.delete('/words/:id', authorization([UserRoles.MERGER, UserRoles.ADMIN]), validId, deleteWord);
editorRouter.get('/words/:id/wordSuggestions', validId, getAssociatedWordSuggestions);
editorRouter.get('/words/:id/twitterPolls', getAssociatedWordSuggestionsByTwitterId);

editorRouter.post('/examples', authorization([UserRoles.MERGER, UserRoles.ADMIN]), validateExampleMerge, mergeExample);
editorRouter.put('/examples/:id', authorization([UserRoles.MERGER, UserRoles.ADMIN]), validId, putExample);
editorRouter.get('/examples/:id/exampleSuggestions', validId, getAssociatedExampleSuggestions);

editorRouter.post('/corpora', authorization([UserRoles.ADMIN]), validateCorpusMerge, mergeCorpus);
editorRouter.put(
  '/corpora/:id',
  authorization([UserRoles.ADMIN]),
  validId,
  validateCorpusBody,
  putCorpus,
);

editorRouter.get('/wordSuggestions', getWordSuggestions);
editorRouter.post(
  '/wordSuggestions',
  authorization([]),
  validateWordBody,
  interactWithSuggestion,
  resolveWordDocument,
  postWordSuggestion,
);
editorRouter.put(
  '/wordSuggestions/:id',
  validId,
  validateWordBody,
  interactWithSuggestion,
  resolveWordDocument,
  putWordSuggestion,
);
editorRouter.get('/wordSuggestions/:id', validId, getWordSuggestion);
editorRouter.put('/wordSuggestions/:id/approve', validId, approveWordSuggestion);
editorRouter.put('/wordSuggestions/:id/deny', validId, denyWordSuggestion);
editorRouter.delete(
  '/wordSuggestions/:id',
  validId,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  deleteWordSuggestion,
);

editorRouter.get('/exampleSuggestions', getExampleSuggestions);

editorRouter.post(
  '/exampleSuggestions',
  authorization(platformRoles),
  validateExampleBody,
  interactWithSuggestion,
  postExampleSuggestion,
);
editorRouter.put('/exampleSuggestions/:id', validId, validateExampleBody, interactWithSuggestion, putExampleSuggestion);
editorRouter.get('/exampleSuggestions/:id', validId, getExampleSuggestion);
editorRouter.put('/exampleSuggestions/:id/approve', validId, approveExampleSuggestion);
editorRouter.put('/exampleSuggestions/:id/deny', validId, denyExampleSuggestion);
editorRouter.delete(
  '/exampleSuggestions/:id',
  validId,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  deleteExampleSuggestion,
);

editorRouter.get('/nsibidiCharacters', getNsibidiCharacters);
editorRouter.get('/nsibidiCharacters/:id', validId, getNsibidiCharacter);
editorRouter.post(
  '/nsibidiCharacters',
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  validateNsibidiCharacterBody,
  postNsibidiCharacter,
);
editorRouter.put(
  '/nsibidiCharacters/:id',
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  validId,
  validateNsibidiCharacterBody,
  putNsibidiCharacter,
);

editorRouter.delete(
  '/corpusSuggestions/:id',
  validId,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  deleteCorpusSuggestion,
);

// TODO: use the new resourcePermission middleware to only grant
// access to stats to the user who owns the stats or the admin
editorRouter.get('/stats/full', getStats);
editorRouter.get('/stats/user', cacheControl, getUserStats);
editorRouter.get('/stats/users/:uid/merge', getUserMergeStats);
editorRouter.get('/stats/users/:uid', cacheControl, getUserStats);

editorRouter.get('/polls', getPolls);

editorRouter.get('/notifications', getNotifications);
editorRouter.get('/notifications/:id', getNotification);
editorRouter.delete('/notifications/:id', deleteNotification);

export default editorRouter;
