import * as admin from 'firebase-admin';
import { forIn } from 'lodash';
import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import AUTH_TOKEN from '../shared/constants/testAuthTokens';
import UserRoles from '../shared/constants/UserRoles';

/* Validates the user-provided auth token */
const authentication = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;

    /* Overrides user role for local development and testing purposes */
    if (!authHeader && process.env.NODE_ENV === 'test') {
      const { role = UserRoles.ADMIN, uid = AUTH_TOKEN.ADMIN_AUTH_TOKEN } = req.query;
      req.user = { role, uid };
      return next();
    }

    if (authHeader) {
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(400).send({ error: "Malformed authorization header. Must start with 'Bearer '" });
      }
      const token = authHeader.split(' ')[1] || '';

      /* Handles injecting user roles for tests */
      if (process.env.NODE_ENV === 'test') {
        forIn(AUTH_TOKEN, (value) => {
          if (token === value) {
            req.user = {
              role: value.split('-')[0],
              uid: token,
              email: 'user@example.com',
              displayName: 'User name',
            };
          }
        });
      }

      try {
        const decoded = await admin.auth().verifyIdToken(token);

        if (decoded && !req.user) {
          req.user = {
            ...decoded,
            uid: decoded.uid,
          };
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
          // console.log(`Firebase authing error: ${err.message}`);
          return res.status(403).send({ error: err.message });
        }
      }
      return next();
    }
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
  return next();
};

export default authentication;
