import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { leaderboardSchema } from 'src/backend/models/Leaderboard';
import { handleQueries } from '../utils';
import { sortLeaderboards } from './utils';
import { findUser } from '../users';

/* Gets the specified page of users in the leaderboard */
export const getLeaderboard = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const {
    skip,
    limit,
    user: { uid },
    leaderboard,
    timeRange,
    mongooseConnection,
  } = handleQueries(req);
  const Leaderboard = mongooseConnection.model<Interfaces.Leaderboard>('Leaderboard', leaderboardSchema);
  if (!leaderboard) {
    throw new Error('Please provide a leaderboard to view');
  }

  const user = (await findUser(uid)) as Interfaces.FormattedUser;
  try {
    let leaderboards = await Leaderboard.find({ type: leaderboard, timeRange });
    if (!leaderboards || !leaderboards.length) {
      leaderboards = [];
    }
    sortLeaderboards(leaderboards);

    const allRankings = leaderboards.map(({ rankings }) => rankings).flat();
    const userIndex = allRankings.findIndex(({ uid }) => uid === user.uid);
    let userRanking = {};
    if (userIndex === -1) {
      // If the user hasn't contributed anything yet, they don't have a position;
      userRanking = { position: null, count: -1, ...user };
    } else {
      userRanking = allRankings[userIndex];
    }

    res.setHeader('Content-Range', allRankings.length);

    const rankings = allRankings.slice(skip, skip + limit);
    return res.send({
      userRanking,
      rankings,
    });
  } catch (err) {
    return next(err);
  }
};
