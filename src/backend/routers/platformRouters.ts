import express from 'express';
import authentication from 'src/backend/middleware/authentication';
import injectProject from 'src/backend/middleware/injectProject';
import injectUserProjectPermission from 'src/backend/middleware/injectUserProjectPermission';
import invitesRouter from 'src/backend/routers/invitesRouter';
import projectsRouter from 'src/backend/routers/projectsRouter';
import apiRouter from 'src/backend/routers/apiRouter';
import editorRouter from 'src/backend/routers/editorRouter';
import crowdsourcerRouter from 'src/backend/routers/crowdsourcerRouter';
import transcriberRouter from 'src/backend/routers/transcriberRouter';
import mergerRouter from 'src/backend/routers/mergerRouter';
import adminRouter from 'src/backend/routers/adminRouter';
import openRouter from 'src/backend/routers/openRouter';

const platformRouters = express.Router();

// Open routes for presentational pages
platformRouters.use(openRouter);

// Before authentication middleware to openly accept invites
platformRouters.use(invitesRouter);
platformRouters.use(authentication);

// Before injecting project or user project permission to request projects first
platformRouters.use(projectsRouter);

platformRouters.use(injectProject, injectUserProjectPermission);
platformRouters.use(apiRouter);
platformRouters.use(crowdsourcerRouter);
platformRouters.use(transcriberRouter);
platformRouters.use(editorRouter);
platformRouters.use(mergerRouter);
platformRouters.use(adminRouter);

export default platformRouters;
