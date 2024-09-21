import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { GET_MAIN_KEY } from 'src/backend/config';
import UserRoles from '../shared/constants/UserRoles';

/* Determines API permission levels based on user role */
const authorization =
  (permittedRoles = []) =>
  (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Response | void => {
    const { user } = req;

    if (!user) {
      return res.status(404).send({ message: 'No user exists on this request.' });
    }

    /* As long as the user has a valid Firebase uid then they have access */
    if (!permittedRoles.length && user.uid) {
      return next();
    }

    /** Admins are granted all access */
    if (user.role === UserRoles.ADMIN) {
      return next();
    }

    /**
     * If the user's role is found in the array of permitted roles,
     * the user is granted access
     */
    if (user && permittedRoles.includes(user.role)) {
      return next();
    }

    /**
     * 🚨 ATTENTION 🚨: This is dangerous. This is saying that if a request using MAIN_KEY,
     * then it will be granted access to whatever resource it's requesting.
     */
    if (req.get('x-api-key') === GET_MAIN_KEY()) {
      // A request is being made on behalf of an official app
      return next();
    }

    return res.status(403).send({ error: 'Unauthorized. Invalid user permissions.' });
  };

export default authorization;
