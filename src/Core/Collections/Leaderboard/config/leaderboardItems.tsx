import React from 'react';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import * as Icons from '../../iconography';
import { LeaderboardItem } from '../components/LeaderboardItem';

const { RECORD_EXAMPLE_AUDIO, IGBO_DEFINITION, VERIFY_EXAMPLE_AUDIO } = LeaderboardType;

const titleMap = {
  [VERIFY_EXAMPLE_AUDIO]: 'Verified recorded sentence',
  [RECORD_EXAMPLE_AUDIO]: 'Recorded example sentence',
  [IGBO_DEFINITION]: 'Referral champions',
};

export const leaderboardItems = [
  {
    children: (
      <LeaderboardItem Icon={<Icons.Done stroke="rgba(189, 0, 255, 1)" />} title={titleMap[VERIFY_EXAMPLE_AUDIO]} />
    ),
    styles: {
      bgColor: 'rgba(248, 229, 255, 1)',
      color: 'rgba(39, 39, 39, 1)',
    },
    title: titleMap[VERIFY_EXAMPLE_AUDIO],
    uid: VERIFY_EXAMPLE_AUDIO,
  },
  {
    children: (
      <LeaderboardItem
        Icon={<Icons.Microphone stroke="rgba(255, 121, 0, 1)" />}
        title={titleMap[RECORD_EXAMPLE_AUDIO]}
      />
    ),
    styles: {
      bgColor: 'rgba(255, 235, 217, 1)',
      color: 'rgba(39, 39, 39, 1)',
    },
    title: titleMap[RECORD_EXAMPLE_AUDIO],
    uid: RECORD_EXAMPLE_AUDIO,
  },
  {
    children: (
      <LeaderboardItem Icon={<Icons.Conflict stroke="rgba(31, 204, 48, 1)" />} title={titleMap[IGBO_DEFINITION]} />
    ),
    styles: {
      bgColor: 'rgba(39, 39, 39, 1)',
      color: 'rgba(250, 250, 250, 1)',
    },
    title: titleMap[IGBO_DEFINITION],
    uid: IGBO_DEFINITION,
  },
];
