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
      <LeaderboardItem Icon={<Icons.Microphone stroke="orange.500" />} title={titleMap[RECORD_EXAMPLE_AUDIO]} />
    ),
    styles: {
      bgColor: 'orange.100',
      color: 'gray.700',
    },
    title: titleMap[RECORD_EXAMPLE_AUDIO],
    id: RECORD_EXAMPLE_AUDIO,
  },
  {
    children: <LeaderboardItem Icon={<Icons.Done stroke="magenta.900" />} title={titleMap[VERIFY_EXAMPLE_AUDIO]} />,
    styles: {
      bgColor: 'magenta.50',
      color: 'gray.700',
    },
    title: titleMap[VERIFY_EXAMPLE_AUDIO],
    id: VERIFY_EXAMPLE_AUDIO,
  },
];
