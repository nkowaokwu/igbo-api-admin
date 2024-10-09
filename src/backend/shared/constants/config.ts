import * as functions from 'firebase-functions/v1';

const config = functions.config();

export const API_ROUTE = config?.runtime?.env === 'production' ? 'https://editor.igboapi.com' : 'http://localhost:3030';
