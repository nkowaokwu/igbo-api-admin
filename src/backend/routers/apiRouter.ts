import express from 'express';
import { anyRoles } from 'src/backend/shared/constants/RolePermissions';
import { getWords, getWord } from '../controllers/words';
import { getExamples, getExample } from '../controllers/examples';
import authentication from '../middleware/authentication';
import authorization from '../middleware/authorization';

const apiRouter = express.Router();
apiRouter.use(authentication, authorization(anyRoles));

apiRouter.get('/words', getWords);
apiRouter.get('/words/:id', getWord);
apiRouter.get('/examples', getExamples);
apiRouter.get('/examples/:id', getExample);

export default apiRouter;
