import express from 'express';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { postBulkUploadExamples } from 'src/backend/controllers/examples';
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
import validateBulkUploadExampleSuggestionBody from 'src/backend/middleware/validateBulkUploadExampleSuggestionBody';
import interactWithSuggestion from 'src/backend/middleware/interactWithSuggestion';
import { transcriberRoles } from 'src/backend/shared/constants/RolePermissions';

const transcriberRouter = express.Router();
transcriberRouter.use(authentication, authorization(transcriberRoles));

transcriberRouter.post(
  '/examples/upload',
  authorization([UserRoles.ADMIN]),
  validateBulkUploadExampleSuggestionBody,
  postBulkUploadExamples,
);

transcriberRouter.get('/corpora', authorization([UserRoles.TRANSCRIBER, UserRoles.ADMIN]), getCorpora);
transcriberRouter.get('/corpora/:id', authorization([UserRoles.TRANSCRIBER, UserRoles.ADMIN]), validId, getCorpus);

transcriberRouter.get('/corpusSuggestions', getCorpusSuggestions);
transcriberRouter.post('/corpusSuggestions', validateCorpusBody, interactWithSuggestion, postCorpusSuggestion);
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
