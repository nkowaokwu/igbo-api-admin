import { Response, NextFunction, RequestHandler } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { GET_MAIN_KEY } from 'src/backend/config';
import UserRoles from '../shared/constants/UserRoles';

/* Determines API permission levels based on user role */
const authorization: (value?: UserRoles[]) => RequestHandler =
  (permittedRoles = []) =>
  (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<void> | void => {
    const { user } = req;

    if (!user) {
      res.status(404).send({ message: 'No user exists on this request.' });
      return;
    }

    /* As long as the user has a valid Firebase uid then they have access */
    if (!permittedRoles.length && user.uid) {
      next();
      return;
    }

    /** Admins are granted all access */
    if (user.role === UserRoles.ADMIN) {
      next();
      return;
    }

    /**
     * If the user's role is found in the array of permitted roles,
     * the user is granted access
     */
    if (user && permittedRoles.includes(user.role)) {
      next();
      return;
    }

    /**
     * 🚨 ATTENTION 🚨: This is dangerous. This is saying that if a request using MAIN_KEY,
     * then it will be granted access to whatever resource it's requesting.
     */
    if (req.get('x-api-key') === GET_MAIN_KEY()) {
      // A request is being made on behalf of an official app
      next();
      return;
    }

    res.status(403).send({ error: 'Unauthorized. Invalid user permissions.' });
  };

export default authorization;
