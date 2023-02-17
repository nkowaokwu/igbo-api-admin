import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import LinearProgressCard from '../LinearProgressCard';

const GOAL = 6000;
const IgboSoundboxStats = ({
  recordingStats,
} : {
  recordingStats: { recorded: number, verified: number },
}): ReactElement => {
  const stats = [
    {
      totalCount: recordingStats.recorded,
      goal: GOAL,
      heading: 'Recorded example sentences',
      description: 'The number of recorded example sentences you have contributed',
    },
    {
      totalCount: recordingStats.verified,
      goal: GOAL,
      heading: 'Verified example sentences',
      description: 'The number of example sentences you have reviewed.',
    },
  ];

  return (
    <Box className="mb-6 space-y-3 w-full">
      <LinearProgressCard
        heading="Igbo Soundbox Contributions"
        description="Your personalized Lacuna Fund statistics"
        stats={stats}
        isLoaded
      />
    </Box>
  );
};

export default IgboSoundboxStats;
