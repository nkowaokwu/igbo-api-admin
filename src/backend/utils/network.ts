import axios, { Method } from 'axios';
import { Request } from 'express';
import querystring from 'querystring';
import { upperCase } from 'lodash';
import Collections from 'src/shared/constants/Collections';
import { CI, IGBO_API_ROOT, GET_MAIN_KEY } from 'src/backend/config';

const logger = (req, method, path, collection) => {
  console.log(`${upperCase(method)} - ${IGBO_API_ROOT}/${collection}${path}?${querystring.stringify(req.query)}`);
};

export default async (
  req: Request,
  {
    method,
    collection,
    path = '',
  } : {
    method: Method,
    collection: Collections,
    path: string,
  },
): Promise<any> => {
  const {
    accept,
    connection,
    referer,
    pragma,
    authorization,
    origin,
  } = req.headers;
  if (!process.env.CI) {
    logger(req, method, path, collection);
  }
  return (
    axios({
      method,
      url: `${IGBO_API_ROOT}/${collection}${path}?${querystring.stringify(req.query)}`,
      headers: {
        ...(accept ? { accept } : {}),
        ...(connection ? { connection } : {}),
        ...(referer ? { referer } : {}),
        ...(pragma ? { pragma } : {}),
        ...(authorization ? { authorization } : {}),
        ...(CI ? { origin: 'localhost:3030' } : origin ? { origin } : { origin: 'localhost:3030' }),
        ...(req.headers['accept-encoding'] ? { 'accept-encoding': req.headers['accept-encoding'] } : {}),
        'X-API-Key': GET_MAIN_KEY(),
      },
      data: req.body || {},
    })
      .catch((error) => {
        console.log('Network Error:', error.response?.data?.error);
        return error.response;
      })
  );
};
