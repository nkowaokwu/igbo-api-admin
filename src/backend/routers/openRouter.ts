import express from 'express';

const openRouter = express.Router();

// General routes
openRouter.get('/home', (_, res) => res.redirect('/#/home'));
openRouter.get('/pricing', (_, res) => res.redirect('/#/pricing'));

export default openRouter;
