import express from 'express';
import { getUserProfile, getUsers, testGetUsers } from '../controllers/users';
import { onSubmitConstructedTermPoll } from '../controllers/polls';
import authentication from '../middleware/authentication';
import authorization from '../middleware/authorization';
import UserRoles from '../shared/constants/UserRoles';

const adminRouter = express.Router();

adminRouter.use(authentication, authorization([UserRoles.ADMIN]));
adminRouter.get('/users', process.env.NODE_ENV === 'test' ? testGetUsers : getUsers);
adminRouter.get('/users/:uid', getUserProfile);
adminRouter.post('/twitter_poll', onSubmitConstructedTermPoll);

export default adminRouter;
