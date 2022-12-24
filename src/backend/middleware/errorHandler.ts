import { disconnectDatabase } from '../utils/database';

// eslint-disable-next-line
export default async (err, req, res, next) => {
  res.status(400);
  /* Depending on the nested error message the status code will change */
  if (err.message.match(/No .{1,} exist(s)?/) || err.message.match(/doesn't exist(s)?/)) {
    res.status(404);
  }
  if (err.stack) {
    console.log(err.stack);
  } else {
    console.log(err?.message);
  }
  await disconnectDatabase();
  return res.send({ error: err.message });
};
