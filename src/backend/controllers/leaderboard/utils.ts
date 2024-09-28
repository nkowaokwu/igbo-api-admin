import * as Interfaces from 'src/backend/controllers/utils/interfaces';

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
