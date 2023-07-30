import { Model, Connection } from 'mongoose';
import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { leaderboardSchema } from 'src/backend/models/Leaderboard';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import countingFunctions from 'src/backend/controllers/leaderboard/countingFunctions';
import {
  searchExampleAudioPronunciationsRecordedByUser,
  searchExampleAudioPronunciationsReviewedByUser,
  searchExampleSuggestionTranslatedByUser,
} from '../utils/queries/leaderboardQueries';
import { handleQueries } from '../utils';
import { sortRankings, splitRankings, assignRankings, sortLeaderboards } from './utils';
import { findUser } from '../users';

const LeaderboardQuery = {
  [LeaderboardType.RECORD_EXAMPLE_AUDIO]: searchExampleAudioPronunciationsRecordedByUser,
  [LeaderboardType.VERIFY_EXAMPLE_AUDIO]: searchExampleAudioPronunciationsReviewedByUser,
  [LeaderboardType.TRANSLATE_IGBO_SENTENCE]: searchExampleSuggestionTranslatedByUser,
};

const updateLeaderboardWithTimeRange = async ({
  Leaderboard,
  ExampleSuggestion,
  leaderboardType,
  timeRange,
  user,
}: {
  Leaderboard: Model<Interfaces.Leaderboard, unknown, unknown>;
  ExampleSuggestion: Model<Interfaces.ExampleSuggestion, unknown, unknown>;
  leaderboardType: LeaderboardType;
  timeRange: LeaderboardTimeRange;
  user: Interfaces.FormattedUser;
}) => {
  const leaderboardQuery = LeaderboardQuery[leaderboardType];
  const query = leaderboardQuery({ uid: user.uid, timeRange });

  let leaderboards = await Leaderboard.find({ type: leaderboardType, timeRange });
  if (!leaderboards || !leaderboards.length) {
    const newLeaderboard = new Leaderboard({
      type: leaderboardType,
      page: 0,
      timeRange,
    });
    leaderboards = [await newLeaderboard.save()];
  }
  sortLeaderboards(leaderboards);

  const allRankings = leaderboards.map(({ rankings }) => rankings).flat();

  const exampleSuggestionsByUser = await ExampleSuggestion.find(query);

  if (!exampleSuggestionsByUser) {
    throw new Error('No example suggestion associated with the user.');
  }

  const fallbackCountingFunction = () => exampleSuggestionsByUser.length;
  const countingFunction = countingFunctions[leaderboardType] || fallbackCountingFunction;

  const totalCount = countingFunction({
    exampleSuggestions: exampleSuggestionsByUser,
    uid: user.uid,
  });

  const updatedRankings = sortRankings({
    leaderboardRankings: allRankings,
    user,
    count: totalCount,
  });

  const rankingsGroups = splitRankings(updatedRankings);

  return assignRankings({
    rankingsGroups,
    leaderboards,
    Leaderboard,
    timeRange,
  });
};

const updateUserLeaderboardStat = async ({
  leaderboardType,
  mongooseConnection,
  user,
}: {
  leaderboardType: LeaderboardType;
  mongooseConnection: Connection;
  user: Interfaces.FormattedUser;
}) => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );
  const Leaderboard = mongooseConnection.model<Interfaces.Leaderboard>('Leaderboard', leaderboardSchema);

  return Promise.all(
    Object.values(LeaderboardTimeRange).map(async (timeRange) =>
      updateLeaderboardWithTimeRange({ Leaderboard, ExampleSuggestion, timeRange, user, leaderboardType }),
    ),
  );
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
      mongooseConnection,
      user,
    });

    return res.send(response);
  } catch (err) {
    return next(err);
  }
};

export const calculateTranslatingExampleLeaderboard = async (
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
      leaderboardType: LeaderboardType.TRANSLATE_IGBO_SENTENCE,
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
      mongooseConnection,
      user,
    });

    return res.send(response);
  } catch (err) {
    return next(err);
  }
};
