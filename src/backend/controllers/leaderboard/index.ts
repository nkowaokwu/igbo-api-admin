import { Connection } from 'mongoose';
import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { leaderboardSchema } from 'src/backend/models/Leaderboard';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import {
  searchExampleAudioPronunciationsRecordedByUser,
  searchExampleAudioPronunciationsReviewedByUser,
} from '../utils/queries';
import { handleQueries } from '../utils';
import {
  sortRankings,
  splitRankings,
  assignRankings,
  sortLeaderboards,
} from './utils';
import { findUser } from '../users';

const updateUserLeaderboardStat = async ({
  leaderboardType,
  query,
  mongooseConnection,
  user,
} : {
  leaderboardType: LeaderboardType,
  query: any,
  mongooseConnection: Connection,
  user: { displayName: string, email: string, photoURL: string, uid: string },
}) => {
  const ExampleSuggestion = (
    mongooseConnection.model<Interfaces.ExampleSuggestion>('ExampleSuggestion', exampleSuggestionSchema)
  );
  const Leaderboard = mongooseConnection.model<Interfaces.Leaderboard>('Leaderboard', leaderboardSchema);

  let leaderboards = await Leaderboard.find({ type: leaderboardType });
  if (!leaderboards || !leaderboards.length) {
    const newLeaderboard = new Leaderboard({
      type: leaderboardType,
      page: 0,
    });
    leaderboards = [await newLeaderboard.save()];
  }
  sortLeaderboards(leaderboards);

  const allRankings = leaderboards.map(({ rankings }) => rankings).flat();

  const exampleSuggestionsByUser = await ExampleSuggestion.find(query);

  if (!exampleSuggestionsByUser) {
    throw new Error('No example suggestion associated with the user.');
  }
  const totalCount = leaderboardType === LeaderboardType.VERIFY_EXAMPLE_AUDIO
    // Count all individual audio pronunciation reviews
    ? exampleSuggestionsByUser.reduce((finalCount, { pronunciations }) => {
      let currentCount = 0;
      pronunciations.forEach(({ approvals, denials }) => {
        if (approvals.includes(user.uid) || denials.includes(user.uid)) {
          currentCount += 1;
        }
      });
      return finalCount + currentCount;
    }, 0)
    : exampleSuggestionsByUser.length;

  const updatedRankings = sortRankings({
    leaderboardRankings: allRankings,
    user,
    count: totalCount,
  });

  const rankingsGroups = splitRankings(updatedRankings);

  await assignRankings({
    rankingsGroups,
    leaderboards,
    Leaderboard,
  });
};

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
    mongooseConnection,
  } = handleQueries(req);
  const Leaderboard = (
    mongooseConnection.model<Interfaces.Leaderboard>('Leaderboard', leaderboardSchema)
  );
  if (!leaderboard) {
    throw new Error('Please provide a leaderboard to view');
  }

  const user = (await findUser(uid)) as Interfaces.FormattedUser;
  try {
    let leaderboards = await Leaderboard.find({ type: leaderboard });
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
    return res.send({
      userRanking,
      rankings: allRankings.slice(skip, skip + limit - 1),
    });
  } catch (err) {
    return next(err);
  }
};

export const calculateRecordingExampleLeaderboard = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const {
    user: { uid },
    error,
    response,
    mongooseConnection,
  } = req;

  if (error) {
    return next(error);
  }

  try {
    const user = (await findUser(uid)) as Interfaces.FormattedUser;
    await updateUserLeaderboardStat({
      leaderboardType: LeaderboardType.RECORD_EXAMPLE_AUDIO,
      query: searchExampleAudioPronunciationsRecordedByUser(user.uid),
      mongooseConnection,
      user,
    });

    return res.send(response);
  } catch (err) {
    return next(err);
  }
};

export const calculateReviewingExampleLeaderboard = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const {
    user: { uid },
    error,
    response,
    mongooseConnection,
  } = req;

  if (error) {
    return next(error);
  }

  try {
    const user = (await findUser(uid)) as Interfaces.FormattedUser;
    await updateUserLeaderboardStat({
      leaderboardType: LeaderboardType.VERIFY_EXAMPLE_AUDIO,
      query: searchExampleAudioPronunciationsReviewedByUser(user.uid),
      mongooseConnection,
      user,
    });

    return res.send(response);
  } catch (err) {
    return next(err);
  }
};
