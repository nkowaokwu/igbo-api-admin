import { assign, cloneDeep } from 'lodash';
import { Model } from 'mongoose';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';

export const sortRankings = ({
  leaderboardRankings,
  user,
  count,
}: {
  leaderboardRankings: Interfaces.Leaderboard['rankings'];
  user: { displayName: string; email: string; photoURL: string; uid: string };
  count: number;
}): Interfaces.Leaderboard['rankings'] => {
  if (!Array.isArray(leaderboardRankings) || !user.uid || typeof count !== 'number') {
    return leaderboardRankings || [];
  }
  let rankings = cloneDeep(leaderboardRankings);
  const userRankingIndex = rankings.findIndex((ranking) => ranking.uid === user.uid);
  if (userRankingIndex === -1) {
    rankings.push({ count, position: -1, ...user });
  } else {
    rankings[userRankingIndex] = { count, position: -1, ...user };
  }
  rankings.sort((firstRanking, secondRanking) => {
    if (firstRanking.count > secondRanking.count) {
      return -1;
    }
    if (firstRanking.count < secondRanking.count) {
      return 1;
    }
    return 0;
  });
  rankings = rankings.map((ranking, index) => {
    const updatedRanking = cloneDeep(ranking);
    updatedRanking.position = index + 1;
    return updatedRanking;
  });
  return rankings;
};

export const splitRankings = (rankings: Interfaces.Leaderboard['rankings']): Interfaces.Leaderboard['rankings'][] => {
  const GROUP_LIMIT = 200;
  let index = 0;
  const rankingsGroups = [];
  while (index < rankings.length) {
    rankingsGroups.push(rankings.slice(index, index + GROUP_LIMIT));
    index += GROUP_LIMIT;
  }
  return rankingsGroups;
};

export const assignRankings = ({
  rankingsGroups,
  leaderboards: externalLeaderboards,
  Leaderboard,
  timeRange,
}: {
  rankingsGroups: Interfaces.Leaderboard['rankings'][];
  leaderboards: Interfaces.Leaderboard[];
  Leaderboard: Model<Interfaces.Leaderboard, unknown, unknown>;
  timeRange: LeaderboardTimeRange;
}): Interfaces.Leaderboard[] => {
  const leaderboards = assign(externalLeaderboards);
  if (rankingsGroups.length !== leaderboards.length) {
    console.error('The number of ranking groups and leaderboards do not match.');
  }
  return rankingsGroups.map((rankings, index) => {
    const leaderboard = leaderboards[index];
    if (!leaderboard) {
      const newLeaderboard = new Leaderboard({
        type: LeaderboardType.RECORD_EXAMPLE_AUDIO,
        page: index,
        timeRange,
      });
      return newLeaderboard;
    }
    leaderboard.rankings = rankings;
    leaderboard.markModified('rankings');
    return leaderboard;
  });
};

export const sortLeaderboards = (leaderboards: Interfaces.Leaderboard[]): void => {
  leaderboards.sort((firstLeaderboard, secondLeaderboard) => {
    if (firstLeaderboard.page < secondLeaderboard.page) {
      return -1;
    }
    if (firstLeaderboard.page > secondLeaderboard.page) {
      return 1;
    }
    return 0;
  });
};
