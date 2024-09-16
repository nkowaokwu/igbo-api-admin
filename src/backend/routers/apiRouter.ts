import express from 'express';
import { anyRoles } from 'src/backend/shared/constants/RolePermissions';
import { getWords, getWord } from '../controllers/words';
import { getExamples, getExample } from '../controllers/examples';
import authorization from '../middleware/authorization';

const apiRouter = express.Router();
apiRouter.use(authorization(anyRoles));

apiRouter.get('/words', getWords);
apiRouter.get('/words/:id', getWord);
apiRouter.get('/examples', getExamples);
apiRouter.get('/examples/:id', getExample);

export default apiRouter;
