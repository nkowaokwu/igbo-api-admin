import { times } from 'lodash';
import { connectDatabase } from 'src/backend/utils/database';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import { leaderboardSchema } from 'src/backend/models/Leaderboard';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import { AUTH_TOKEN } from 'src/__tests__/shared/constants';
import { updateLeaderboardWithTimeRange } from '..';
import * as utils from '../utils';
import { rankings } from './data';

const user = {
  id: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
  displayName: 'admin',
  uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
  email: 'email',
  photoURL: '',
};

describe('leaderboard index', () => {
  it('updates the leaderboard with stats', async () => {
    const mongooseConnection = await connectDatabase();
    const Leaderboard = mongooseConnection.model<Interfaces.Leaderboard>('Leaderboard', leaderboardSchema);
    const exampleSuggestions = [
      { id: '123', igbo: 'igbo sentence', pronunciations: [{ audio: 'audio', speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN }] },
    ];
    const ExampleSuggestion = { find: jest.fn(() => exampleSuggestions) };
    const sortLeaderboardsSpy = jest.spyOn(utils, 'sortLeaderboards');
    const sortRankingsSpy = jest.spyOn(utils, 'sortRankings');
    const leaderboards = await Promise.all(
      times(1, (index) => {
        const leaderboard = new Leaderboard({
          type: LeaderboardType.RECORD_EXAMPLE_AUDIO,
          timeRange: LeaderboardTimeRange.ALL_TIME,
          rankings,
          page: index,
        });
        return leaderboard.save();
      }),
    );
    await updateLeaderboardWithTimeRange({
      Leaderboard,
      // @ts-expect-error
      ExampleSuggestion,
      leaderboardType: LeaderboardType.RECORD_EXAMPLE_AUDIO,
      timeRange: LeaderboardTimeRange.ALL_TIME,
      // @ts-expect-error
      user,
      leaderboards,
    });
    expect(sortLeaderboardsSpy).toBeCalledWith(leaderboards);
    expect(sortRankingsSpy).toBeCalled();
  });
});
