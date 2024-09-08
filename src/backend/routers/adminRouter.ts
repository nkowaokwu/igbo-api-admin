import express from 'express';
import { adminRoles } from 'src/backend/shared/constants/RolePermissions';
import authorization from 'src/backend/middleware/authorization';
import authentication from 'src/backend/middleware/authentication';
import { getUsers, testGetUsers } from '../controllers/users';
import { onSubmitConstructedTermPoll } from '../controllers/polls';

const adminRouter = express.Router();
adminRouter.use(authentication, authorization(adminRoles));

const userController = process.env.NODE_ENV === 'test' ? testGetUsers : getUsers;
adminRouter.get('/users', userController);
adminRouter.post('/twitter_poll', onSubmitConstructedTermPoll);

export default adminRouter;
