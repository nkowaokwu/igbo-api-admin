import express from 'express';
import { getProjectById, getUserProjects, postProject } from 'src/backend/controllers/projects';
import { getUserProjectPermission, putUserProjectPermission } from 'src/backend/controllers/userProjectPermissions';
import validateUserProjectPermissionBody from 'src/backend/middleware/validateUserProjectPermissionBody';
import validId from 'src/backend/middleware/validId';
import Collection from 'src/shared/constants/Collection';

const projectsRouter = express.Router();

// Project
projectsRouter.get(`/${Collection.PROJECTS}/user`, getUserProjects);
projectsRouter.post(`/${Collection.PROJECTS}`, postProject);
projectsRouter.get(`/${Collection.PROJECTS}/:id`, validId, getProjectById);
projectsRouter.get(`/${Collection.USER_PROJECT_PERMISSIONS}`, getUserProjectPermission);
projectsRouter.put(
  `/${Collection.USER_PROJECT_PERMISSIONS}`,
  validateUserProjectPermissionBody,
  putUserProjectPermission,
);

export default projectsRouter;
