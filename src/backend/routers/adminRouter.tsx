import express from 'express';
import { getUser, getUsers, testGetUsers } from '../controllers/users';
import { getUserStats, getUserMergeStats } from '../controllers/stats';
import { onSubmitConstructedTermPoll } from '../controllers/polls';
import authentication from '../middleware/authentication';
import authorization from '../middleware/authorization';
import cacheControl from '../middleware/cacheControl';
import UserRoles from '../shared/constants/UserRoles';

const adminRouter = express.Router();

adminRouter.use(authentication, authorization([UserRoles.ADMIN]));
adminRouter.get('/users', process.env.NODE_ENV === 'test' ? testGetUsers : getUsers);
adminRouter.get('/users/:uid', getUser);
adminRouter.get('/stats/users/:uid/merge', getUserMergeStats);
adminRouter.get('/stats/users/:uid', cacheControl, getUserStats);
adminRouter.post('/twitter_poll', onSubmitConstructedTermPoll);

export default adminRouter;
