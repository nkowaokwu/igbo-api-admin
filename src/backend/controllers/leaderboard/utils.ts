import { cloneDeep } from 'lodash';
import { Model } from 'mongoose';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { referralSchema } from 'src/backend/models/Referral';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import { ReferralPoints } from 'src/shared/constants/ReferralPoints';
import { connectDatabase } from 'src/backend/utils/database';

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

export const assignRankings = async ({
  rankingsGroups,
  leaderboards,
  Leaderboard,
  timeRange,
}: {
  rankingsGroups: Interfaces.Leaderboard['rankings'][];
  leaderboards: Interfaces.Leaderboard[];
  Leaderboard: Model<Interfaces.Leaderboard, unknown, unknown>;
  timeRange: LeaderboardTimeRange;
}): Promise<Interfaces.Leaderboard[]> =>
  Promise.all(
    rankingsGroups.map(async (rankings, index) => {
      const leaderboard = leaderboards[index];
      if (!leaderboard) {
        const newLeaderboard = new Leaderboard({
          type: LeaderboardType.RECORD_EXAMPLE_AUDIO,
          page: index,
          timeRange,
        });
        await newLeaderboard.save();
      }
      leaderboard.rankings = rankings;
      leaderboard.markModified('rankings');
      return leaderboard.save();
    }),
  );

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

/**
 * Calculates referral points by multiplying the total occurrences
 * of a user's referrerId by a factor of 20. Similarly, referred user points
 * are determined by applying a factor of 10 to the total occurrences of a user's referredUserId.
 *
 * @param {string} id - crowdsourcer id
 * @returns {number} The total amount of referral points relating to a crowdsourcer
 */
export const getReferralPoints = async (id: string): Promise<number> => {
  const connection = await connectDatabase();
  const Referral = connection.model<Interfaces.Referral>('Referral', referralSchema);
  const referrerCount = (await Referral.count({ referrerId: id })) * ReferralPoints.REFERRER;
  const referredUserCount = (await Referral.count({ referredUserId: id })) * ReferralPoints.REFERRED_USER;

  return referrerCount + referredUserCount;
};
