import express from 'express';
import { deleteCorpusSuggestion } from 'src/backend/controllers/corpusSuggestions';
import { mergeExample, putExample } from 'src/backend/controllers/examples';
import { bulkDeleteExampleSuggestions, deleteExampleSuggestion } from 'src/backend/controllers/exampleSuggestions';
import { deleteWord, mergeWord, putWord } from 'src/backend/controllers/words';
import {
  bulkDeleteWordSuggestions,
  deleteWordSuggestion,
  postRandomWordSuggestionsForIgboDefinitions,
} from 'src/backend/controllers/wordSuggestions';
import authorization from 'src/backend/middleware/authorization';
import validateApprovals from 'src/backend/middleware/validateApprovals';
import validateBulkDeleteLimit from 'src/backend/middleware/validateBulkDeleteLimit';
import validateExampleMerge from 'src/backend/middleware/validateExampleMerge';
import validateWordMerge from 'src/backend/middleware/validateWordMerge';
import validId from 'src/backend/middleware/validId';
import { mergerRoles } from 'src/backend/shared/constants/RolePermissions';
import Collection from 'src/shared/constants/Collection';

const mergerRouter = express.Router();
mergerRouter.use(authorization(mergerRoles));

mergerRouter.post(`/${Collection.WORDS}`, validateWordMerge, validateApprovals, mergeWord);
mergerRouter.put(`/${Collection.WORDS}/:id`, validId, putWord);
mergerRouter.delete(`/${Collection.WORDS}/:id`, validId, deleteWord);

mergerRouter.post(`/${Collection.EXAMPLES}`, validateExampleMerge, mergeExample);
mergerRouter.put(`/${Collection.EXAMPLES}/:id`, validId, putExample);

mergerRouter.delete(`/${Collection.EXAMPLE_SUGGESTIONS}/:id`, validId, deleteExampleSuggestion);
mergerRouter.delete(`/${Collection.EXAMPLE_SUGGESTIONS}`, validateBulkDeleteLimit, bulkDeleteExampleSuggestions);

mergerRouter.post(`/${Collection.WORD_SUGGESTIONS}/igbo-definitions`, postRandomWordSuggestionsForIgboDefinitions);
mergerRouter.delete(`/${Collection.WORD_SUGGESTIONS}/:id`, validId, deleteWordSuggestion);
mergerRouter.delete(`/${Collection.WORD_SUGGESTIONS}`, validateBulkDeleteLimit, bulkDeleteWordSuggestions);

mergerRouter.delete(`/${Collection.CORPUS_SUGGESTIONS}/:id`, validId, deleteCorpusSuggestion);

export default mergerRouter;
