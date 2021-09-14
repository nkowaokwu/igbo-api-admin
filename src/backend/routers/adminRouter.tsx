import express from 'express';
import { getUser, getUsers, testGetUsers } from '../controllers/users';
import authentication from '../middleware/authentication';
import authorization from '../middleware/authorization';
import UserRoles from '../shared/constants/UserRoles';

const adminRouter = express.Router();

adminRouter.use(authentication, authorization([UserRoles.ADMIN]));
adminRouter.get('/users', process.env.NODE_ENV === 'test' ? testGetUsers : getUsers);
adminRouter.get('/users/:uid', getUser);

export default adminRouter;
