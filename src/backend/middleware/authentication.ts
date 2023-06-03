import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { forIn } from 'lodash';
import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import AUTH_TOKEN from '../shared/constants/testAuthTokens';
import UserRoles from '../shared/constants/UserRoles';

const config = functions.config();
/* Validates the user-provided auth token */
const authentication = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const authHeader = req?.headers?.Authorization || req?.headers?.authorization;

    /* Overrides user role for local development and testing purposes */
    if (!authHeader && (config?.runtime?.env === 'cypress' || process.env.NODE_ENV === 'test')) {
      const { role = UserRoles.ADMIN, uid = AUTH_TOKEN.ADMIN_AUTH_TOKEN, editingGroup = 1 } = req.query;
      req.user = { role, uid, editingGroup };
      return next();
    }

    if (authHeader) {
      if (!authHeader.startsWith('Bearer ')) {
        throw new Error('Malformed authorization header. Must start with \'Bearer\'');
      }
      const token = authHeader.split(' ')[1] || '';

      /* Handles injecting user roles for tests */
      if (process.env.NODE_ENV === 'test') {
        forIn(AUTH_TOKEN, (value) => {
          if (token === value) {
            req.user = {
              role: value.split('-')[0],
              uid: token,
              editingGroup: 1,
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
            role: decoded.role,
            uid: decoded.uid,
            editingGroup: decoded.editingGroup,
          };
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
          console.log(`Firebase authing error: ${err.message}`);
          return res
            .status(403)
            .send({ error: err.message });
        }
      }
      return next();
    }
  } catch (err) {
    return res
      .status(400)
      .send({ error: err.message });
  }
  return next();
};

export default authentication;
