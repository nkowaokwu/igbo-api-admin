import express from 'express';
import { adminRoles } from 'src/backend/shared/constants/RolePermissions';
import authorization from 'src/backend/middleware/authorization';
import Collection from 'src/shared/constants/Collection';
import validId from 'src/backend/middleware/validId';
import validateProjectBody from 'src/backend/middleware/validateProjectBody';
import { getUsers, testGetUsers } from '../controllers/users';
import { putProject } from '../controllers/projects';
import { onSubmitConstructedTermPoll } from '../controllers/polls';

const adminRouter = express.Router();
adminRouter.use(authorization(adminRoles));

const userController = process.env.NODE_ENV === 'test' ? testGetUsers : getUsers;
adminRouter.get('/users', userController);
adminRouter.post('/twitter_poll', onSubmitConstructedTermPoll);

// Projects
adminRouter.put(`/${Collection.PROJECTS}/:id`, validId, validateProjectBody, putProject);

export default adminRouter;
