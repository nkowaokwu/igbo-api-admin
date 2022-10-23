import express from 'express';
import {
  deleteWordSuggestion,
  getWordSuggestion,
  getWordSuggestions,
  putWordSuggestion,
  postWordSuggestion,
} from '../controllers/wordSuggestions';
import {
  deleteCorpusSuggestion,
  getCorpusSuggestion,
  getCorpusSuggestions,
  putCorpusSuggestion,
  postCorpusSuggestion,
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
  putExampleSuggestion,
  postExampleSuggestion,
} from '../controllers/exampleSuggestions';
import { getStats, getUserStats, getUserMergeStats } from '../controllers/stats';
import {
  deleteGenericWord,
  getGenericWords,
  putGenericWord,
  getGenericWord,
} from '../controllers/genericWords';
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
import cacheControl from '../middleware/cacheControl';
import interactWithSuggestion from '../middleware/interactWithSuggestion';
import UserRoles from '../shared/constants/UserRoles';

const editorRouter = express.Router();
editorRouter.use(authentication, authorization([UserRoles.EDITOR, UserRoles.MERGER, UserRoles.ADMIN]));

/* These routes are used to allow users to suggest new words and examples */
editorRouter.post('/words', authorization([UserRoles.MERGER, UserRoles.ADMIN]), validateWordMerge, mergeWord);
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
editorRouter.post('/wordSuggestions', authorization([]), validateWordBody, interactWithSuggestion, postWordSuggestion);
editorRouter.put('/wordSuggestions/:id', validId, validateWordBody, interactWithSuggestion, putWordSuggestion);
editorRouter.get('/wordSuggestions/:id', validId, getWordSuggestion);
editorRouter.delete(
  '/wordSuggestions/:id',
  validId,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  deleteWordSuggestion,
);

editorRouter.get('/exampleSuggestions', getExampleSuggestions);
editorRouter.post(
  '/exampleSuggestions',
  authorization([]),
  validateExampleBody,
  interactWithSuggestion,
  postExampleSuggestion,
);
editorRouter.put('/exampleSuggestions/:id', validId, validateExampleBody, interactWithSuggestion, putExampleSuggestion);
editorRouter.get('/exampleSuggestions/:id', validId, getExampleSuggestion);
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

editorRouter.put('/genericWords/:id', validId, putGenericWord);
editorRouter.get('/genericWords', getGenericWords);
editorRouter.get('/genericWords/:id', validId, getGenericWord);
editorRouter.delete(
  '/genericWords/:id',
  validId,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  deleteGenericWord,
);

editorRouter.get('/polls', getPolls);

editorRouter.get('/notifications', getNotifications);
editorRouter.get('/notifications/:id', getNotification);
editorRouter.delete('/notifications/:id', deleteNotification);

export default editorRouter;
