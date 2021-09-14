import express from 'express';
import { onSendNewSuggestionsEmail } from '../controllers/triggers';

const triggersRouter = express.Router();

triggersRouter.post('/newSuggestion', onSendNewSuggestionsEmail);

export default triggersRouter;
