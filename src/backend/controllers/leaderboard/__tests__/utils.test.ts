import { cloneDeep, times } from 'lodash';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import { connectDatabase } from 'src/backend/utils/database';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import { leaderboardSchema } from 'src/backend/models/Leaderboard';
import { sortLeaderboards, sortRankings, splitRankings, assignRankings } from '../utils';
import { rankings } from './data';

const manyRankings = times(434, (index) => ({
  uid: `${index} user`,
  id: `${index} user`,
  email: 'user@example.com',
  displayName: 'User name',
  photoURL: '',
  count: Math.floor(Math.random() * 1000),
  position: Math.floor(Math.random() * 434),
}));

describe('leaderboard utils', () => {
  describe('sortRankings', () => {
    it('sorts the rankings in the correct order with the same user count', () => {
      const clonedRankings = cloneDeep(rankings);
      const updatedRankings = sortRankings({
        leaderboardRankings: clonedRankings,
        user: {
          uid: 'second user',
          displayName: 'User name',
          email: 'user@example.com',
          photoURL: '',
        },
        count: 45,
      });
      expect(updatedRankings).toEqual([
        {
          uid: 'first user',
          id: 'first user',
          displayName: 'User name',
          email: 'user@example.com',
          photoURL: '',
          count: 123,
          position: 1,
        },
        {
          uid: 'second user',
          displayName: 'User name',
          email: 'user@example.com',
          photoURL: '',
          count: 45,
          position: 2,
        },
        {
          uid: 'third user',
          id: 'third user',
          displayName: 'User name',
          email: 'user@example.com',
          photoURL: '',
          count: 3,
          position: 3,
        },
      ]);
    });
    it('sorts the rankings in the correct order with a different user count', () => {
      const clonedRankings = cloneDeep(rankings);
      const updatedRankings = sortRankings({
        leaderboardRankings: clonedRankings,
        user: {
          uid: 'second user',
          displayName: 'User name',
          email: 'user@example.com',
          photoURL: '',
        },
        count: 300,
      });
      expect(updatedRankings).toEqual([
        {
          uid: 'second user',
          displayName: 'User name',
          email: 'user@example.com',
          photoURL: '',
          count: 300,
          position: 1,
        },
        {
          uid: 'first user',
          id: 'first user',
          displayName: 'User name',
          email: 'user@example.com',
          photoURL: '',
          count: 123,
          position: 2,
        },
        {
          uid: 'third user',
          id: 'third user',
          displayName: 'User name',
          email: 'user@example.com',
          photoURL: '',
          count: 3,
          position: 3,
        },
      ]);
    });
    it('sorts the rankings in the correct order with new user', () => {
      const clonedRankings = cloneDeep(rankings);
      const updatedRankings = sortRankings({
        leaderboardRankings: clonedRankings,
        user: {
          uid: 'fourth user',
          displayName: 'User name',
          email: 'user@example.com',
          photoURL: '',
        },
        count: 50,
      });
      expect(updatedRankings).toEqual([
        {
          uid: 'first user',
          id: 'first user',
          displayName: 'User name',
          email: 'user@example.com',
          photoURL: '',
          count: 123,
          position: 1,
        },
        {
          uid: 'fourth user',
          displayName: 'User name',
          email: 'user@example.com',
          photoURL: '',
          count: 50,
          position: 2,
        },
        {
          uid: 'second user',
          id: 'second user',
          displayName: 'User name',
          email: 'user@example.com',
          photoURL: '',
          count: 45,
          position: 3,
        },
        {
          uid: 'third user',
          id: 'third user',
          displayName: 'User name',
          email: 'user@example.com',
          photoURL: '',
          count: 3,
          position: 4,
        },
      ]);
    });
    it('returns an empty array with no leaderboard rankings', () => {
      const updatedRankings = sortRankings({
        leaderboardRankings: null,
        user: {
          uid: 'fourth user',
          displayName: 'User',
          email: 'email@example.com',
          photoURL: '',
        },
        count: 50,
      });
      expect(updatedRankings).toEqual([]);
    });
    it('returns an empty array with no uid', () => {
      const updatedRankings = sortRankings({
        leaderboardRankings: [],
        user: {
          uid: '',
          displayName: 'User',
          email: 'email@example.com',
          photoURL: '',
        },
        count: 50,
      });
      expect(updatedRankings).toEqual([]);
    });
    it('returns an empty array with no count', () => {
      const updatedRankings = sortRankings({
        leaderboardRankings: [],
        user: {
          uid: 'fourth user',
          displayName: 'User',
          email: 'email@example.com',
          photoURL: '',
        },
        count: null,
      });
      expect(updatedRankings).toEqual([]);
    });
  });

  describe('splitRankings', () => {
    it('splits 434 unorganized rankings', () => {
      const rankingGroups = splitRankings(manyRankings);
      expect(rankingGroups).toHaveLength(3);
    });
    it('splits 434 organized rankings', () => {
      const rankingGroups = splitRankings(
        sortRankings({
          leaderboardRankings: manyRankings,
          user: {
            uid: '0 user',
            displayName: 'User',
            email: 'email@example.com',
            photoURL: '',
          },
          count: 10,
        }),
      );
      rankingGroups.forEach((rankingGroup) => {
        rankingGroup.forEach((ranking, index) => {
          if (index + 1 < rankingGroup.length) {
            expect(ranking.position).toBeLessThan(rankingGroup[index + 1].position);
            expect(ranking.count).toBeGreaterThanOrEqual(rankingGroup[index + 1].count);
          }
        });
      });
      expect(rankingGroups).toHaveLength(3);
    });
  });

  describe('sortLeaderboards', () => {
    it('sorts an array of leaderboards', () => {
      const leaderboards = [{ page: 1 }, { page: 2 }, { page: 0 }];
      // @ts-expect-error
      sortLeaderboards(leaderboards);
      expect(leaderboards).toEqual([{ page: 0 }, { page: 1 }, { page: 2 }]);
    });
  });

  describe('assignRankings', () => {
    it('assigns the expected rankings to leaderboards', async () => {
      const mongooseConnection = await connectDatabase();
      const Leaderboard = mongooseConnection.model<Interfaces.Leaderboard>('Leaderboard', leaderboardSchema);
      const leaderboards = await Promise.all(
        times(2, (index) => {
          const leaderboard = new Leaderboard({
            type: LeaderboardType.RECORD_EXAMPLE_AUDIO,
            timeRange: LeaderboardTimeRange.ALL_TIME,
            page: index,
          });
          return leaderboard.save();
        }),
      );
      const finalLeaderboards = assignRankings({
        rankingsGroups: [rankings, []],
        leaderboards,
        Leaderboard,
        timeRange: LeaderboardTimeRange.ALL_TIME,
      });
      finalLeaderboards[0].rankings.forEach((ranking, index) => {
        expect(ranking.count).toEqual(rankings[index].count);
        expect(ranking.position).toEqual(rankings[index].position);
      });
      expect(finalLeaderboards[1].rankings.length).toEqual(0);
    });
  });
});
