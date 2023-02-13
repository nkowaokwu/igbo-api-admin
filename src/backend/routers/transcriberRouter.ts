import express from 'express';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import {
  getRandomExampleSuggestions,
  postBulkUploadExampleSuggestions,
  getRandomExampleSuggestionsToReview,
  getTotalVerifiedExampleSuggestions,
  getTotalRecordedExampleSuggestions,
  putRandomExampleSuggestions,
} from 'src/backend/controllers/exampleSuggestions';
import {
  getCorpusSuggestion,
  getCorpusSuggestions,
  putCorpusSuggestion,
  postCorpusSuggestion,
  approveCorpusSuggestion,
  denyCorpusSuggestion,
} from 'src/backend/controllers/corpusSuggestions';
import { getCorpora, getCorpus } from 'src/backend/controllers/corpora';
import validId from 'src/backend/middleware/validId';
import authentication from 'src/backend/middleware/authentication';
import authorization from 'src/backend/middleware/authorization';
import validateCorpusBody from 'src/backend/middleware/validateCorpusBody';
import validateRandomExampleSuggestionBody from 'src/backend/middleware/validateRandomExampleSuggestionBody';
import validateBulkUploadExampleSuggestionBody from 'src/backend/middleware/validateBulkUploadExampleSuggestionBody';
import interactWithSuggestion from 'src/backend/middleware/interactWithSuggestion';
import resourcePermission from 'src/backend/middleware/resourcePermission';

const transcriberRouter = express.Router();
const allRoles = [UserRoles.EDITOR, UserRoles.MERGER, UserRoles.ADMIN, UserRoles.TRANSCRIBER];
transcriberRouter.use(authentication, authorization(allRoles));

transcriberRouter.get('/exampleSuggestions/random', getRandomExampleSuggestions);
transcriberRouter.put(
  '/exampleSuggestions/random',
  validateRandomExampleSuggestionBody,
  putRandomExampleSuggestions,
);
transcriberRouter.post(
  '/exampleSuggestions/upload',
  authorization([UserRoles.ADMIN]),
  validateBulkUploadExampleSuggestionBody,
  postBulkUploadExampleSuggestions,
);
transcriberRouter.get('/exampleSuggestions/random/review', getRandomExampleSuggestionsToReview);
transcriberRouter.get(
  '/exampleSuggestions/random/stats/verified',
  resourcePermission,
  getTotalVerifiedExampleSuggestions,
);
transcriberRouter.get(
  '/exampleSuggestions/random/stats/recorded',
  resourcePermission,
  getTotalRecordedExampleSuggestions,
);

transcriberRouter.get('/corpora', authorization([UserRoles.TRANSCRIBER, UserRoles.ADMIN]), getCorpora);
transcriberRouter.get('/corpora/:id', authorization([UserRoles.TRANSCRIBER, UserRoles.ADMIN]), validId, getCorpus);

transcriberRouter.get('/corpusSuggestions', getCorpusSuggestions);
transcriberRouter.post(
  '/corpusSuggestions',
  validateCorpusBody,
  interactWithSuggestion,
  postCorpusSuggestion,
);
transcriberRouter.put(
  '/corpusSuggestions/:id',
  validId,
  validateCorpusBody,
  interactWithSuggestion,
  putCorpusSuggestion,
);
transcriberRouter.get('/corpusSuggestions/:id', validId, getCorpusSuggestion);
transcriberRouter.put('/corpusSuggestions/:id/approve', validId, approveCorpusSuggestion);
transcriberRouter.put('/corpusSuggestions/:id/deny', validId, denyCorpusSuggestion);

export default transcriberRouter;
