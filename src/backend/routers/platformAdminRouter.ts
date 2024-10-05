import express from 'express';
import { getProjects } from 'src/backend/controllers/projects';
import authorization from 'src/backend/middleware/authorization';
import { platformAdminRoles } from 'src/backend/shared/constants/RolePermissions';
import Collection from 'src/shared/constants/Collection';

const platformAdminRouter = express.Router();
platformAdminRouter.use(authorization(platformAdminRoles));

// Projects
platformAdminRouter.get(`/${Collection.PROJECTS}`, getProjects);

export default platformAdminRouter;
