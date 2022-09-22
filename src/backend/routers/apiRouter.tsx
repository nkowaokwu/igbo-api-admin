import express from 'express';
import { getWords, getWord } from '../controllers/words';
import { getConstructedTerms } from '../controllers/constructedTerms';
import { getExamples, getExample } from '../controllers/examples';
import authentication from '../middleware/authentication';
import authorization from '../middleware/authorization';

const apiRouter = express.Router();
apiRouter.use(authentication, authorization([]));

apiRouter.get('/words', getWords);
apiRouter.get('/words/:id', getWord);
apiRouter.get('/examples', getExamples);
apiRouter.get('/examples/:id', getExample);
apiRouter.get('/constructedTerms', getConstructedTerms);
apiRouter.get('/constructedTerms/:id', getWord);

export default apiRouter;
