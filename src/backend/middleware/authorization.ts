import { GET_MAIN_KEY } from '../config';
import UserRoles from '../shared/constants/UserRoles';

/* Determines API permission levels based on user role */
const authorization = (permittedRoles = []) => (req, res, next) => {
  const { user = {} } = req;

  /* As long as the user has a valid Firebase uid then they have access */
  if (!permittedRoles.length && user.uid) {
    return next();
  }

  if ((user && permittedRoles.includes(user.role)) || user.role === UserRoles.ADMIN) {
    /* If the user's role is found in the array of permitted roles,
    * the user is granted access
    */
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

  return res
    .status(403)
    .send({ error: 'Unauthorized. Invalid user permissions.' });
};

export default authorization;
