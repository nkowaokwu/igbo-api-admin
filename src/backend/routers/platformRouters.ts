import express from 'express';
import injectProject from 'src/backend/middleware/injectProject';
import editorRouter from 'src/backend/routers/editorRouter';
import crowdsourcerRouter from 'src/backend/routers/crowdsourcerRouter';
import transcriberRouter from 'src/backend/routers/transcriberRouter';
import adminRouter from 'src/backend/routers/adminRouter';

const platformRouters = express.Router();

platformRouters.use(injectProject);
platformRouters.use(editorRouter);
platformRouters.use(crowdsourcerRouter);
platformRouters.use(transcriberRouter);
platformRouters.use(adminRouter);

export default platformRouters;
