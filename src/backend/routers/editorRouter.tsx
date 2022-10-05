import express from 'express';
import {
  deleteWordSuggestion,
  getWordSuggestion,
  getWordSuggestions,
  putWordSuggestion,
  postWordSuggestion,
} from '../controllers/wordSuggestions';
import {
  deleteWord,
  putWord,
  mergeWord,
  getAssociatedWordSuggestions,
} from '../controllers/words';
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
import cacheControl from '../middleware/cacheControl';
import interactWithSuggsetion from '../middleware/interactWithSuggsetion';
import UserRoles from '../shared/constants/UserRoles';

const editorRouter = express.Router();
editorRouter.use(authentication, authorization([UserRoles.EDITOR, UserRoles.MERGER, UserRoles.ADMIN]));

/* These routes are used to allow users to suggest new words and examples */
editorRouter.post('/words', authorization([UserRoles.MERGER, UserRoles.ADMIN]), validateWordMerge, mergeWord);
editorRouter.put('/words/:id', authorization([UserRoles.MERGER, UserRoles.ADMIN]), validId, putWord);
editorRouter.delete('/words/:id', authorization([UserRoles.MERGER, UserRoles.ADMIN]), validId, deleteWord);
editorRouter.get('/words/:id/wordSuggestions', validId, getAssociatedWordSuggestions);

editorRouter.post('/examples', authorization([UserRoles.MERGER, UserRoles.ADMIN]), validateExampleMerge, mergeExample);
editorRouter.put('/examples/:id', authorization([UserRoles.MERGER, UserRoles.ADMIN]), validId, putExample);
editorRouter.get('/examples/:id/exampleSuggestions', validId, getAssociatedExampleSuggestions);

editorRouter.get('/wordSuggestions', getWordSuggestions);
editorRouter.post('/wordSuggestions', authorization([]), validateWordBody, interactWithSuggsetion, postWordSuggestion);
editorRouter.put('/wordSuggestions/:id', validId, validateWordBody, interactWithSuggsetion, putWordSuggestion);
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
  interactWithSuggsetion,
  postExampleSuggestion,
);
editorRouter.put('/exampleSuggestions/:id', validId, validateExampleBody, interactWithSuggsetion, putExampleSuggestion);
editorRouter.get('/exampleSuggestions/:id', validId, getExampleSuggestion);
editorRouter.delete(
  '/exampleSuggestions/:id',
  validId,
  authorization([UserRoles.MERGER, UserRoles.ADMIN]),
  deleteExampleSuggestion,
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
