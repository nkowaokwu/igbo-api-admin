import express from 'express';
import { adminRoles } from 'src/backend/shared/constants/RolePermissions';
import authorization from 'src/backend/middleware/authorization';
import Collection from 'src/shared/constants/Collection';
import validId from 'src/backend/middleware/validId';
import validateProjectBody from 'src/backend/middleware/validateProjectBody';
import validateBulkUploadExampleSuggestionBody from 'src/backend/middleware/validateBulkUploadExampleSuggestionBody';
import { postBulkUploadExampleSuggestions } from 'src/backend/controllers/exampleSuggestions';
import { cancelMemberInvite, inviteMember } from 'src/backend/controllers/invites';
import validateMemberInviteBody from 'src/backend/middleware/validateMemberInviteBody';
import { putUserProjectPermissionAsAdmin } from 'src/backend/controllers/userProjectPermissions';
import validatePutUserRoleBody from 'src/backend/middleware/validatePutUserRoleBody';
import { postExport } from 'src/backend/controllers/exports';
import { getUsers, testGetUsers } from '../controllers/users';
import { putProject } from '../controllers/projects';
import { onSubmitConstructedTermPoll } from '../controllers/polls';

const adminRouter = express.Router();
adminRouter.use(authorization(adminRoles));

const userController = process.env.NODE_ENV === 'test' ? testGetUsers : getUsers;
adminRouter.get('/users', userController);
adminRouter.put('/users/:uid/roles', validatePutUserRoleBody, putUserProjectPermissionAsAdmin);
adminRouter.post('/twitter_poll', onSubmitConstructedTermPoll);

// Uploads new example suggestions to record and review
adminRouter.post(
  `/${Collection.EXAMPLE_SUGGESTIONS}/upload`,
  authorization(adminRoles),
  validateBulkUploadExampleSuggestionBody,
  postBulkUploadExampleSuggestions,
);

// Projects
adminRouter.put(`/${Collection.PROJECTS}/:id`, validId, validateProjectBody, putProject);

// Invite Members
adminRouter.post(`/${Collection.INVITES}`, validateMemberInviteBody, inviteMember);
adminRouter.delete(`/${Collection.INVITES}/cancel`, validateMemberInviteBody, cancelMemberInvite);

// Export Data
adminRouter.post(`/exports`, postExport);

export default adminRouter;
