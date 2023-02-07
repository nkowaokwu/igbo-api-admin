import express from 'express';
import {
  deleteWordSuggestion,
  getWordSuggestion,
  getWordSuggestions,
  putWordSuggestion,
  postWordSuggestion,
  approveWordSuggestion,
  denyWordSuggestion,
} from '../controllers/wordSuggestions';
import {
  deleteCorpusSuggestion,
  getCorpusSuggestion,
  getCorpusSuggestions,
  putCorpusSuggestion,
  postCorpusSuggestion,
  approveCorpusSuggestion,
  denyCorpusSuggestion,
} from '../controllers/corpusSuggestions';
import {
  deleteWord,
  putWord,
  mergeWord,
  getAssociatedWordSuggestions,
  getAssociatedWordSuggestionsByTwitterId,
} from '../controllers/words';
import {
  getCorpora,
  getCorpus,
  putCorpus,
  mergeCorpus,
} from '../controllers/corpora';
import { putExample, mergeExample, getAssociatedExampleSuggestions } from '../controllers/examples';
import {
  deleteExampleSuggestion,
  getExampleSuggestion,
  getExampleSuggestions,
  getRandomExampleSuggestions,
  postBulkUploadExampleSuggestions,
  getRandomExampleSuggestionsToReview,
  getTotalVerifiedExampleSuggestions,
  getTotalRecordedExampleSuggestions,
  putRandomExampleSuggestions,
  putExampleSuggestion,
  postExampleSuggestion,
  approveExampleSuggestion,
  denyExampleSuggestion,
} from '../controllers/exampleSuggestions';
import {
  getStats,
  getUserStats,
  getUserMergeStats,
} from '../controllers/stats';
import { getPolls } from '../controllers/polls';
import { getNotifications, getNotification, deleteNotification } from '../controllers/notifications';
import validId from '../middleware/validId';
import authentication from '../middleware/authentication';
import authorization from '../middleware/authorization';
import validateExampleBody from '../middleware/validateExampleBody';
import validateExampleMerge from '../middleware/validateExampleMerge';
import validateWordBody from '../middleware/validateWordBody';
import validateWordMerge from '../middleware/validateWordMerge';
import validateCorpusBody from '../middleware/validateCorpusBody';
import validateCorpusMerge from '../middleware/validateCorpusMerge';
import validateApprovals from '../middleware/validateApprovals';
import cacheControl from '../middleware/cacheControl';
import validateRandomExampleSuggestionBody from '../middleware/validateRandomExampleSuggestionBody';
import validateBulkUploadExampleSuggestionBody from '../middleware/validateBulkUploadExampleSuggestionBody';
import interactWithSuggestion from '../middleware/interactWithSuggestion';
import resolveWordDocument from '../middleware/resolveWordDocument';
import UserRoles from '../shared/constants/UserRoles';

const editorRouter = express.Router();
editorRouter.use(authentication, authorization([UserRoles.EDITOR, UserRoles.MERGER, UserRoles.ADMIN]));

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

editorRouter.get('/corpora', getCorpora);
editorRouter.get('/corpora/:id', validId, getCorpus);
editorRouter.post('/corpora', authorization([UserRoles.MERGER, UserRoles.ADMIN]), validateCorpusMerge, mergeCorpus);
editorRouter.put(
  '/corpora/:id',
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
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
editorRouter.get('/exampleSuggestions/random', getRandomExampleSuggestions);
editorRouter.put('/exampleSuggestions/random', validateRandomExampleSuggestionBody, putRandomExampleSuggestions);
editorRouter.post(
  '/exampleSuggestions/upload',
  validateBulkUploadExampleSuggestionBody,
  postBulkUploadExampleSuggestions,
);
editorRouter.get('/exampleSuggestions/random/review', getRandomExampleSuggestionsToReview);
editorRouter.get('/exampleSuggestions/random/stats/verified', getTotalVerifiedExampleSuggestions);
editorRouter.get('/exampleSuggestions/random/stats/recorded', getTotalRecordedExampleSuggestions);
editorRouter.post(
  '/exampleSuggestions',
  authorization([]),
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

editorRouter.get('/corpusSuggestions', getCorpusSuggestions);
editorRouter.post('/corpusSuggestions', validateCorpusBody, interactWithSuggestion, postCorpusSuggestion);
editorRouter.put('/corpusSuggestions/:id', validId, validateCorpusBody, interactWithSuggestion, putCorpusSuggestion);
editorRouter.get('/corpusSuggestions/:id', validId, getCorpusSuggestion);
editorRouter.put('/corpusSuggestions/:id/approve', validId, approveCorpusSuggestion);
editorRouter.put('/corpusSuggestions/:id/deny', validId, denyCorpusSuggestion);
editorRouter.delete(
  '/corpusSuggestions/:id',
  validId,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  deleteCorpusSuggestion,
);

editorRouter.get('/stats/full', getStats);
editorRouter.get('/stats/user', cacheControl, getUserStats);
editorRouter.get('/stats/users/:uid/merge', getUserMergeStats);
editorRouter.get('/stats/users/:uid', cacheControl, getUserStats);

editorRouter.get('/polls', getPolls);

editorRouter.get('/notifications', getNotifications);
editorRouter.get('/notifications/:id', getNotification);
editorRouter.delete('/notifications/:id', deleteNotification);

export default editorRouter;
