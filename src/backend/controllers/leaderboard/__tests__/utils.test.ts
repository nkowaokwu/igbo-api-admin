import { cloneDeep, times } from 'lodash';
import * as database from '../../../utils/database';
import { getReferralPoints, sortLeaderboards, sortRankings, splitRankings } from '../utils';

const rankings = [
  {
    id: 'second user',
    uid: 'second user',
    email: 'user@example.com',
    displayName: 'User name',
    photoURL: '',
    count: 45,
    position: 0,
  },
  {
    id: 'first user',
    uid: 'first user',
    email: 'user@example.com',
    displayName: 'User name',
    photoURL: '',
    count: 123,
    position: 2,
  },
  {
    id: 'third user',
    uid: 'third user',
    email: 'user@example.com',
    displayName: 'User name',
    photoURL: '',
    count: 3,
    position: 1,
  },
];
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

  describe('getReferralPoints', () => {
    const mockDb = jest.spyOn(database, 'connectDatabase');
    const countMock = jest.fn();

    mockDb.mockImplementation(
      () =>
        Promise.resolve({
          model: () => ({
            count: countMock,
          }),
        }) as any,
    );

    it.each([
      {
        referred: 7,
        referredUser: 1,
        expected: 150,
      },
      {
        referred: 0,
        referredUser: 0,
        expected: 0,
      },
      {
        referred: 9,
        referredUser: 0,
        expected: 180,
      },
      {
        referred: 55,
        referredUser: 1,
        expected: 1110,
      },
    ])('should return correct referral points', async (fixture) => {
      // arrange
      const id = 'awesome-id';
      countMock.mockResolvedValueOnce(fixture.referred);
      countMock.mockResolvedValueOnce(fixture.referredUser);

      // act
      const result = await getReferralPoints(id);

      // assert
      expect(result).toEqual(fixture.expected);
      expect(countMock).toHaveBeenNthCalledWith(1, { referrerId: id });
      expect(countMock).toHaveBeenNthCalledWith(2, { referredUserId: id });
    });
  });
});
