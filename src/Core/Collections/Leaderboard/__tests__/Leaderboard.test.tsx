import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import { getLeaderboardStats } from 'src/shared/DataCollectionAPI';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import Leaderboard from '..';

describe('Leaderboard', () => {
  it('render all leaderboard time frames', async () => {
    const { findByText } = render(
      <TestContext groupIndex={0}>
        <Leaderboard />
      </TestContext>,
    );
    await findByText('All time');
    await findByText('Weekly');
    await findByText('Monthly');
    await findByText('Igbo Voice-athon');
  });

  it('fetches the relevant time frame leaderboard data', async () => {
    const { findByText } = render(
      <TestContext groupIndex={0}>
        <Leaderboard />
      </TestContext>,
    );
    userEvent.click(await findByText('All time'));
    userEvent.click(await findByText('Weekly'));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    userEvent.click(await findByText('Monthly'));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    userEvent.click(await findByText('Igbo Voice-athon'));
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(getLeaderboardStats.mock.calls).toEqual([
      [
        {
          leaderboard: LeaderboardType.RECORD_EXAMPLE_AUDIO,
          timeRange: LeaderboardTimeRange.ALL_TIME,
        },
      ],
      [
        {
          leaderboard: LeaderboardType.RECORD_EXAMPLE_AUDIO,
          timeRange: LeaderboardTimeRange.WEEK,
        },
      ],
      [
        {
          leaderboard: LeaderboardType.RECORD_EXAMPLE_AUDIO,
          timeRange: LeaderboardTimeRange.MONTH,
        },
      ],
      [
        {
          leaderboard: LeaderboardType.RECORD_EXAMPLE_AUDIO,
          timeRange: LeaderboardTimeRange.IGBO_VOICE_ATHON,
        },
      ],
    ]);
  });
});
