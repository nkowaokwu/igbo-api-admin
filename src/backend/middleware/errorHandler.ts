import { isProduction } from 'src/backend/config';
import { disconnectDatabase } from '../utils/database';

// eslint-disable-next-line
export default async (err, req, res, next) => {
  res.status(400);
  /* Depending on the nested error message the status code will change */
  if (err.message.match(/No .{1,} exist(s)?/) || err.message.match(/doesn't exist(s)?/)) {
    res.status(404);
  }
  if (!isProduction) {
    if (err.stack) {
      // console.log(err.stack);
    } else {
      // console.log(err?.message);
    }
  }

  if (isProduction) {
    // Send error to Cloud Logging
    // logger.error(err?.message || err?.details);
  }

  await disconnectDatabase();
  return res.send({ error: err.message });
};
