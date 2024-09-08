import express from 'express';
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
import authorization from 'src/backend/middleware/authorization';
import validateCorpusBody from 'src/backend/middleware/validateCorpusBody';
import validateBulkUploadExampleSuggestionBody from 'src/backend/middleware/validateBulkUploadExampleSuggestionBody';
import interactWithSuggestion from 'src/backend/middleware/interactWithSuggestion';
import { adminRoles, transcriberOnlyRoles, transcriberRoles } from 'src/backend/shared/constants/RolePermissions';
import authentication from 'src/backend/middleware/authentication';

const transcriberRouter = express.Router();
transcriberRouter.use(authentication, authorization(transcriberRoles));

transcriberRouter.post(
  '/examples/upload',
  authorization(adminRoles),
  validateBulkUploadExampleSuggestionBody,
  postBulkUploadExamples,
);

transcriberRouter.get('/corpora', authorization(transcriberOnlyRoles), getCorpora);
transcriberRouter.get('/corpora/:id', authorization(transcriberOnlyRoles), validId, getCorpus);

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
