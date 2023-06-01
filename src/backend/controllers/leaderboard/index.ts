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

const updateUserLeaderboardStat = async ({
  leaderboardType,
  query,
  mongooseConnection,
  uid,
} : {
  leaderboardType: LeaderboardType,
  query: any,
  mongooseConnection: Connection,
  uid: string,
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

  const updatedRankings = sortRankings({
    leaderboardRankings: allRankings,
    uid,
    count: exampleSuggestionsByUser.length,
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
    user,
    leaderboard,
    mongooseConnection,
  } = handleQueries(req);
  const Leaderboard = (
    mongooseConnection.model<Interfaces.Leaderboard>('Leaderboard', leaderboardSchema)
  );
  if (!leaderboard) {
    throw new Error('Please provide a leaderboard to view');
  }

  try {
    // @ts-expect-error
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
      userRanking = { uid: user.uid, position: null, count: -1 };
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
    user,
    error,
    response,
    mongooseConnection,
  } = req;
  const { uid } = user;

  if (error) {
    return next(error);
  }

  try {
    await updateUserLeaderboardStat({
      leaderboardType: LeaderboardType.RECORD_EXAMPLE_AUDIO,
      query: searchExampleAudioPronunciationsRecordedByUser(uid),
      mongooseConnection,
      uid,
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
    user,
    error,
    response,
    mongooseConnection,
  } = req;
  const { uid } = user;

  if (error) {
    return next(error);
  }

  try {
    await updateUserLeaderboardStat({
      leaderboardType: LeaderboardType.VERIFY_EXAMPLE_AUDIO,
      query: searchExampleAudioPronunciationsReviewedByUser(uid),
      mongooseConnection,
      uid,
    });

    return res.send(response);
  } catch (err) {
    return next(err);
  }
};
