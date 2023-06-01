import { cloneDeep } from 'lodash';
import { Model } from 'mongoose';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';

export const sortRankings = ({
  leaderboardRankings,
  uid,
  count,
} : {
  leaderboardRankings: Interfaces.Leaderboard['rankings'],
  uid: string,
  count: number,
}): Interfaces.Leaderboard['rankings'] => {
  if (!Array.isArray(leaderboardRankings) || !uid || typeof count !== 'number') {
    return leaderboardRankings || [];
  }
  let rankings = cloneDeep(leaderboardRankings);
  const userRankingIndex = rankings.findIndex((ranking) => ranking.uid === uid);
  if (userRankingIndex === -1) {
    rankings.push({ count, uid, position: -1 });
  } else {
    rankings[userRankingIndex] = { count, uid, position: -1 };
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

export const assignRankings = async ({
  rankingsGroups,
  leaderboards,
  Leaderboard,
} : {
  rankingsGroups: Interfaces.Leaderboard['rankings'][],
  leaderboards: Interfaces.Leaderboard[],
  Leaderboard: Model<Interfaces.Leaderboard, unknown, unknown>,
}): Promise<void> => {
  await Promise.all(rankingsGroups.map(async (rankings, index) => {
    const leaderboard = leaderboards[index];
    if (!leaderboard) {
      const newLeaderboard = new Leaderboard({
        type: LeaderboardType.RECORD_EXAMPLE_AUDIO,
        page: index,
      });
      await newLeaderboard.save();
    }
    leaderboard.rankings = rankings;
    await leaderboard.save();
  }));
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
