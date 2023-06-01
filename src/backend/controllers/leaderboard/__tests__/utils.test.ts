import { cloneDeep, times } from 'lodash';
import { sortLeaderboards, sortRankings, splitRankings } from '../utils';

const rankings = [
  { uid: 'second user', count: 45, position: 0 },
  { uid: 'first user', count: 123, position: 2 },
  { uid: 'third user', count: 3, position: 1 },
];
const manyRankings = times(434, (index) => ({
  uid: `${index} user`,
  count: Math.floor(Math.random() * 1000),
  position: Math.floor(Math.random() * 434),
}));

describe('leaderboard utils', () => {
  describe('sortRankings', () => {
    it('sorts the rankings in the correct order with the same user count', () => {
      const clonedRankings = cloneDeep(rankings);
      const updatedRankings = sortRankings({ leaderboardRankings: clonedRankings, uid: 'second user', count: 45 });
      expect(updatedRankings).toEqual([
        { uid: 'first user', count: 123, position: 1 },
        { uid: 'second user', count: 45, position: 2 },
        { uid: 'third user', count: 3, position: 3 },
      ]);
    });
    it('sorts the rankings in the correct order with a different user count', () => {
      const clonedRankings = cloneDeep(rankings);
      const updatedRankings = sortRankings({ leaderboardRankings: clonedRankings, uid: 'second user', count: 300 });
      expect(updatedRankings).toEqual([
        { uid: 'second user', count: 300, position: 1 },
        { uid: 'first user', count: 123, position: 2 },
        { uid: 'third user', count: 3, position: 3 },
      ]);
    });
    it('sorts the rankings in the correct order with new user', () => {
      const clonedRankings = cloneDeep(rankings);
      const updatedRankings = sortRankings({ leaderboardRankings: clonedRankings, uid: 'fourth user', count: 50 });
      expect(updatedRankings).toEqual([
        { uid: 'first user', count: 123, position: 1 },
        { uid: 'fourth user', count: 50, position: 2 },
        { uid: 'second user', count: 45, position: 3 },
        { uid: 'third user', count: 3, position: 4 },
      ]);
    });
    it('returns an empty array with no leaderboard rankings', () => {
      const updatedRankings = sortRankings({ leaderboardRankings: null, uid: 'fourth user', count: 50 });
      expect(updatedRankings).toEqual([]);
    });
    it('returns an empty array with no uid', () => {
      const updatedRankings = sortRankings({ leaderboardRankings: [], uid: '', count: 50 });
      expect(updatedRankings).toEqual([]);
    });
    it('returns an empty array with no count', () => {
      const updatedRankings = sortRankings({ leaderboardRankings: [], uid: 'fourth user', count: null });
      expect(updatedRankings).toEqual([]);
    });
  });

  describe('splitRankings', () => {
    it('splits 434 unorganized rankings', () => {
      const rankingGroups = splitRankings(manyRankings);
      expect(rankingGroups).toHaveLength(3);
    });
    it('splits 434 organized rankings', () => {
      const rankingGroups = splitRankings(sortRankings({
        leaderboardRankings: manyRankings,
        uid: '0 user',
        count: 10,
      }));
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
});
